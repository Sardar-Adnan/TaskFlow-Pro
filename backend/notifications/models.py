from django.db import models
from django.conf import settings

class Notification(models.Model):
    TYPE_CHOICES = (
        ('task_assigned', 'Task Assigned'),
        ('task_status', 'Task Status Updated'),
        ('new_comment', 'New Discussion Comment'),
        ('deadline', 'Deadline Approaching'),
        ('project_added', 'Added to Project'),
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=30, choices=TYPE_CHOICES)
    message = models.TextField()
    related_task = models.ForeignKey('projects.Task', on_delete=models.CASCADE, null=True, blank=True)
    related_project = models.ForeignKey('projects.Project', on_delete=models.CASCADE, null=True, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
