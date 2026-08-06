from rest_framework import viewsets, generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Project, ProjectMember, Task
from .serializers import (
    ProjectSerializer, ProjectCreateSerializer, ProjectMemberSerializer,
    TaskSerializer, TaskCreateSerializer, TaskStatusUpdateSerializer
)
from users.permissions import IsAdmin, IsProjectManager, IsTeamMember, IsAdminOrPM
from django.contrib.auth import get_user_model
from rest_framework.exceptions import PermissionDenied, ValidationError

User = get_user_model()

class ProjectViewSet(viewsets.ModelViewSet):
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ProjectCreateSerializer
        return ProjectSerializer

    def get_permissions(self):
        if self.action == 'create':
            permission_classes = [permissions.IsAuthenticated, IsAdmin]
        elif self.action == 'destroy':
            permission_classes = [permissions.IsAuthenticated, IsAdmin]
        elif self.action in ['update', 'partial_update']:
            permission_classes = [permissions.IsAuthenticated, IsAdminOrPM]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Project.objects.all()
        elif user.role == 'pm':
            return Project.objects.filter(manager=user)
        else:
            return Project.objects.filter(members__user=user)

    def perform_create(self, serializer):
        project = serializer.save()
        if project.manager:
            ProjectMember.objects.get_or_create(project=project, user=project.manager)

    def perform_update(self, serializer):
        if self.request.user.role == 'pm' and 'manager' in serializer.validated_data:
            serializer.validated_data.pop('manager')
        serializer.save()

class ProjectMemberViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectMemberSerializer

    def get_permissions(self):
        if self.action in ['create', 'destroy']:
            permission_classes = [permissions.IsAuthenticated, IsAdminOrPM]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return ProjectMember.objects.filter(project_id=project_id)

    def perform_create(self, serializer):
        project = get_object_or_404(Project, id=self.kwargs.get('project_id'))
        
        if self.request.user.role == 'pm' and project.manager != self.request.user:
            raise PermissionDenied("You are not the manager of this project.")
            
        user = serializer.validated_data['user']
        if user.role != 'member':
            raise ValidationError("Only users with role 'member' can be added.")
            
        serializer.save(project=project)

    def destroy(self, request, *args, **kwargs):
        project = get_object_or_404(Project, id=self.kwargs.get('project_id'))
        if request.user.role == 'pm' and project.manager != request.user:
            return Response({"detail": "You are not the manager of this project."}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

class TaskViewSet(viewsets.ModelViewSet):
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return TaskCreateSerializer
        return TaskSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated, IsAdminOrPM]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        user = self.request.user
        
        qs = Task.objects.filter(project_id=project_id)
        
        if user.role == 'admin':
            return qs
        elif user.role == 'pm':
            project = get_object_or_404(Project, id=project_id)
            if project.manager == user:
                return qs
            return qs.none()
        else:
            return qs.filter(assignee=user)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        if 'project_id' in self.kwargs:
            context['project'] = get_object_or_404(Project, id=self.kwargs.get('project_id'))
        return context

    def perform_create(self, serializer):
        project = get_object_or_404(Project, id=self.kwargs.get('project_id'))
        if self.request.user.role == 'pm' and project.manager != self.request.user:
            raise PermissionDenied("You are not the manager of this project.")
            
        serializer.save(project=project, created_by=self.request.user)

    def perform_update(self, serializer):
        project = get_object_or_404(Project, id=self.kwargs.get('project_id'))
        if self.request.user.role == 'pm' and project.manager != self.request.user:
            raise PermissionDenied("You are not the manager of this project.")
        serializer.save()

    def perform_destroy(self, instance):
        project = instance.project
        if self.request.user.role == 'pm' and project.manager != self.request.user:
            raise PermissionDenied("You are not the manager of this project.")
        instance.delete()

class TaskDetailView(generics.RetrieveAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Task.objects.all()
        elif user.role == 'pm':
            return Task.objects.filter(project__manager=user)
        else:
            return Task.objects.filter(assignee=user)

class TaskStatusUpdateView(generics.UpdateAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskStatusUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Task.objects.all()
        elif user.role == 'pm':
            return Task.objects.filter(project__manager=user)
        else:
            return Task.objects.filter(assignee=user)

class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role == 'admin':
            stats = {
                'total_users': User.objects.count(),
                'total_projects': Project.objects.count(),
                'active_tasks': Task.objects.exclude(status='completed').count(),
                'completed_tasks': Task.objects.filter(status='completed').count()
            }
        elif user.role == 'pm':
            stats = {
                'my_projects': Project.objects.filter(manager=user).count(),
                'total_tasks': Task.objects.filter(project__manager=user).count(),
                'pending_tasks': Task.objects.filter(project__manager=user).exclude(status='completed').count(),
                'completed_tasks': Task.objects.filter(project__manager=user, status='completed').count()
            }
        else:
            stats = {
                'assigned_tasks': Task.objects.filter(assignee=user).count(),
                'in_progress': Task.objects.filter(assignee=user, status='in_progress').count(),
                'in_review': Task.objects.filter(assignee=user, status='review').count(),
                'completed': Task.objects.filter(assignee=user, status='completed').count()
            }
        return Response(stats)
