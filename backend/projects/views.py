from rest_framework import viewsets, generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Project, ProjectMember, Task, Discussion, ActivityLog
from .serializers import (
    ProjectSerializer, ProjectCreateSerializer, ProjectMemberSerializer,
    TaskSerializer, TaskCreateSerializer, TaskStatusUpdateSerializer, DiscussionSerializer, ActivityLogSerializer
)
from users.permissions import IsAdmin, IsProjectManager, IsTeamMember, IsAdminOrPM
from django.contrib.auth import get_user_model
from rest_framework.exceptions import PermissionDenied, ValidationError

User = get_user_model()

def log_activity(user, action, target_type, target_name, project=None, details=''):
    ActivityLog.objects.create(
        user=user, action=action, target_type=target_type,
        target_name=target_name, project=project, details=details
    )


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
        qs = Project.objects.none()
        
        if user.role == 'admin':
            qs = Project.objects.all()
        elif user.role == 'pm':
            qs = Project.objects.filter(manager=user)
        else:
            qs = Project.objects.filter(members__user=user)

        search = self.request.query_params.get('search')
        status_param = self.request.query_params.get('status')
        priority = self.request.query_params.get('priority')
        ordering = self.request.query_params.get('ordering')

        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(description__icontains=search))
        if status_param:
            qs = qs.filter(status=status_param)
        if priority:
            qs = qs.filter(priority=priority)
        if ordering:
            qs = qs.order_by(ordering)

        return qs

    def perform_create(self, serializer):
        project = serializer.save()
        if project.manager:
            ProjectMember.objects.get_or_create(project=project, user=project.manager)
        log_activity(self.request.user, 'created', 'project', project.name, project)

    def perform_update(self, serializer):
        if self.request.user.role == 'pm' and 'manager' in serializer.validated_data:
            serializer.validated_data.pop('manager')
        project = serializer.save()
        log_activity(self.request.user, 'updated', 'project', project.name, project)

    def perform_destroy(self, instance):
        log_activity(self.request.user, 'deleted', 'project', instance.name, None)
        instance.delete()

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
            
        member = serializer.save(project=project)
        log_activity(self.request.user, 'member_added', 'member', user.email, project)

    def destroy(self, request, *args, **kwargs):
        project = get_object_or_404(Project, id=self.kwargs.get('project_id'))
        if request.user.role == 'pm' and project.manager != request.user:
            return Response({"detail": "You are not the manager of this project."}, status=status.HTTP_403_FORBIDDEN)
        
        instance = self.get_object()
        user_email = instance.user.email
        log_activity(request.user, 'member_removed', 'member', user_email, project)
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
            pass
        elif user.role == 'pm':
            project = get_object_or_404(Project, id=project_id)
            if project.manager != user:
                qs = qs.none()
        else:
            qs = qs.filter(assignee=user)

        search = self.request.query_params.get('search')
        status_param = self.request.query_params.get('status')
        priority = self.request.query_params.get('priority')
        assignee = self.request.query_params.get('assignee')
        ordering = self.request.query_params.get('ordering')

        if search:
            qs = qs.filter(Q(title__icontains=search) | Q(description__icontains=search))
        if status_param:
            qs = qs.filter(status=status_param)
        if priority:
            qs = qs.filter(priority=priority)
        if assignee:
            qs = qs.filter(assignee_id=assignee)
        if ordering:
            qs = qs.order_by(ordering)

        return qs

    def get_serializer_context(self):
        context = super().get_serializer_context()
        if 'project_id' in self.kwargs:
            context['project'] = get_object_or_404(Project, id=self.kwargs.get('project_id'))
        return context

    def perform_create(self, serializer):
        project = get_object_or_404(Project, id=self.kwargs.get('project_id'))
        if self.request.user.role == 'pm' and project.manager != self.request.user:
            raise PermissionDenied("You are not the manager of this project.")
            
        task = serializer.save(project=project, created_by=self.request.user)
        log_activity(self.request.user, 'created', 'task', task.title, project)

    def perform_update(self, serializer):
        project = get_object_or_404(Project, id=self.kwargs.get('project_id'))
        if self.request.user.role == 'pm' and project.manager != self.request.user:
            raise PermissionDenied("You are not the manager of this project.")
        task = serializer.save()
        log_activity(self.request.user, 'updated', 'task', task.title, project)

    def perform_destroy(self, instance):
        project = instance.project
        if self.request.user.role == 'pm' and project.manager != self.request.user:
            raise PermissionDenied("You are not the manager of this project.")
        log_activity(self.request.user, 'deleted', 'task', instance.title, project)
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

    def perform_update(self, serializer):
        task = serializer.save()
        log_activity(self.request.user, 'status_changed', 'task', task.title, task.project, details=f"Status changed to {task.status}")

class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role == 'admin':
            recent_projects = Project.objects.order_by('-created_at')[:5]
            stats = {
                'total_users': User.objects.count(),
                'total_projects': Project.objects.count(),
                'active_tasks': Task.objects.exclude(status='completed').count(),
                'completed_tasks': Task.objects.filter(status='completed').count(),
                'recent_projects': [{'id': p.id, 'name': p.name, 'status': p.status, 'created_at': p.created_at} for p in recent_projects]
            }
        elif user.role == 'pm':
            recent_tasks = Task.objects.filter(project__manager=user).order_by('-created_at')[:5]
            stats = {
                'my_projects': Project.objects.filter(manager=user).count(),
                'total_tasks': Task.objects.filter(project__manager=user).count(),
                'pending_tasks': Task.objects.filter(project__manager=user).exclude(status='completed').count(),
                'completed_tasks': Task.objects.filter(project__manager=user, status='completed').count(),
                'recent_tasks': TaskSerializer(recent_tasks, many=True).data
            }
        else:
            from django.utils import timezone
            upcoming_tasks = Task.objects.filter(assignee=user, due_date__gte=timezone.now().date()).order_by('due_date')[:5]
            stats = {
                'assigned_tasks': Task.objects.filter(assignee=user).count(),
                'in_progress': Task.objects.filter(assignee=user, status='in_progress').count(),
                'in_review': Task.objects.filter(assignee=user, status='review').count(),
                'completed': Task.objects.filter(assignee=user, status='completed').count(),
                'upcoming_tasks': TaskSerializer(upcoming_tasks, many=True).data
            }
        return Response(stats)

class DiscussionViewSet(viewsets.ModelViewSet):
    serializer_class = DiscussionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        task_id = self.kwargs.get('task_id')
        return Discussion.objects.filter(task_id=task_id)

    def perform_create(self, serializer):
        task = get_object_or_404(Task, id=self.kwargs.get('task_id'))
        user = self.request.user
        if user.role == 'admin':
            pass
        elif user.role == 'pm':
            if task.project.manager != user:
                raise PermissionDenied("Not authorized")
        else:
            if task.assignee != user:
                raise PermissionDenied("Not authorized")
        discussion = serializer.save(task=task, user=self.request.user)
        log_activity(self.request.user, 'comment_added', 'task', task.title, task.project)

class ActivityLogView(generics.ListAPIView):
    serializer_class = ActivityLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        project_id = self.request.query_params.get('project_id')
        
        if project_id:
            qs = ActivityLog.objects.filter(project_id=project_id)
        elif user.role == 'admin':
            qs = ActivityLog.objects.all()
        elif user.role == 'pm':
            qs = ActivityLog.objects.filter(project__manager=user)
        else:
            qs = ActivityLog.objects.filter(project__members__user=user)
        
        return qs[:50]
