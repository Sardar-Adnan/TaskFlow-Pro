from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProjectViewSet, ProjectMemberViewSet, TaskViewSet,
    TaskStatusUpdateView, TaskDetailView, DashboardStatsView, DiscussionViewSet,
    ActivityLogView
)

router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')

urlpatterns = [
    path('', include(router.urls)),
    
    path('projects/<int:project_id>/members/', ProjectMemberViewSet.as_view({'get': 'list', 'post': 'create'}), name='project-members-list'),
    path('projects/<int:project_id>/members/<int:pk>/', ProjectMemberViewSet.as_view({'delete': 'destroy'}), name='project-members-detail'),
    
    path('projects/<int:project_id>/tasks/', TaskViewSet.as_view({'get': 'list', 'post': 'create'}), name='project-tasks-list'),
    path('projects/<int:project_id>/tasks/<int:pk>/', TaskViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update',
        'delete': 'destroy'
    }), name='project-tasks-detail'),
    
    path('tasks/<int:pk>/status/', TaskStatusUpdateView.as_view(), name='task-status-update'),
    path('tasks/<int:pk>/', TaskDetailView.as_view(), name='task-detail'),
    path('tasks/<int:task_id>/discussions/', DiscussionViewSet.as_view({'get': 'list', 'post': 'create'}), name='task-discussions'),
    
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('activity/', ActivityLogView.as_view(), name='activity-log'),
]
