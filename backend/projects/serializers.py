from rest_framework import serializers
from .models import Project, ProjectMember, Task, ActivityLog
from django.contrib.auth import get_user_model
from users.serializers import UserSerializer

User = get_user_model()

class ActivityLogSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = ActivityLog
        fields = ['id', 'user', 'action', 'target_type', 'target_name', 'project', 'details', 'created_at']


class ProjectSerializer(serializers.ModelSerializer):
    manager = UserSerializer(read_only=True)
    member_count = serializers.SerializerMethodField()
    task_count = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = '__all__'

    def get_member_count(self, obj):
        return obj.members.count()
    
    def get_task_count(self, obj):
        return obj.tasks.count()

class ProjectCreateSerializer(serializers.ModelSerializer):
    manager = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False)

    class Meta:
        model = Project
        fields = ['name', 'description', 'start_date', 'end_date', 'priority', 'status', 'manager']

    def validate(self, data):
        if 'start_date' in data and 'end_date' in data:
            if data['end_date'] <= data['start_date']:
                raise serializers.ValidationError({"end_date": "End date must be after start date."})
        return data

class ProjectMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), 
        source='user', 
        write_only=True
    )

    class Meta:
        model = ProjectMember
        fields = ['id', 'user', 'user_id', 'joined_at']

class TaskSerializer(serializers.ModelSerializer):
    assignee = UserSerializer(read_only=True)
    created_by = UserSerializer(read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)

    class Meta:
        model = Task
        fields = '__all__'

class TaskCreateSerializer(serializers.ModelSerializer):
    assignee = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False, allow_null=True)

    class Meta:
        model = Task
        fields = ['title', 'description', 'assignee', 'priority', 'due_date', 'status']

    def validate(self, data):
        project = self.context.get('project')
        assignee = data.get('assignee')
        if assignee and project:
            if not project.members.filter(user=assignee).exists() and project.manager != assignee:
                raise serializers.ValidationError({"assignee": "Assignee must be a member of the project."})
        return data

class TaskStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['status']

from .models import Discussion

class DiscussionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Discussion
        fields = ['id', 'user', 'content', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']
