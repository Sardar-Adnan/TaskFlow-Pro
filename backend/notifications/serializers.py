from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'type', 'message', 'related_task', 'related_project', 'is_read', 'created_at']
        read_only_fields = ['id', 'type', 'message', 'related_task', 'related_project', 'created_at']
