from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from projects.models import Task, Discussion, ProjectMember
from notifications.models import Notification

@receiver(pre_save, sender=Task)
def task_pre_save(sender, instance, **kwargs):
    if instance.pk:
        try:
            old_task = Task.objects.get(pk=instance.pk)
            instance._old_assignee = old_task.assignee
            instance._old_status = old_task.status
        except Task.DoesNotExist:
            instance._old_assignee = None
            instance._old_status = None
    else:
        instance._old_assignee = None
        instance._old_status = None

@receiver(post_save, sender=Task)
def task_post_save(sender, instance, created, **kwargs):
    # Task Assigned
    if created and instance.assignee:
        Notification.objects.create(
            user=instance.assignee,
            type='task_assigned',
            message=f"You have been assigned to task '{instance.title}' in project '{instance.project.name}'",
            related_task=instance,
            related_project=instance.project
        )
    elif not created:
        old_assignee = getattr(instance, '_old_assignee', None)
        if instance.assignee and instance.assignee != old_assignee:
            Notification.objects.create(
                user=instance.assignee,
                type='task_assigned',
                message=f"You have been assigned to task '{instance.title}' in project '{instance.project.name}'",
                related_task=instance,
                related_project=instance.project
            )
            
        old_status = getattr(instance, '_old_status', None)
        if instance.status != old_status:
            pm = instance.project.manager
            creator = instance.created_by
            message = f"Task '{instance.title}' status changed to '{instance.status}'"
            
            notified_users = set()
            if pm:
                Notification.objects.create(
                    user=pm,
                    type='task_status',
                    message=message,
                    related_task=instance,
                    related_project=instance.project
                )
                notified_users.add(pm.id)
                
            if creator and creator.id not in notified_users:
                Notification.objects.create(
                    user=creator,
                    type='task_status',
                    message=message,
                    related_task=instance,
                    related_project=instance.project
                )

@receiver(post_save, sender=Discussion)
def discussion_post_save(sender, instance, created, **kwargs):
    if created:
        task = instance.task
        assignee = task.assignee
        pm = task.project.manager
        commenter = instance.user
        message = f"{commenter.name} commented on task '{task.title}'"
        
        notified_users = set([commenter.id])
        
        if assignee and assignee.id not in notified_users:
            Notification.objects.create(
                user=assignee,
                type='new_comment',
                message=message,
                related_task=task,
                related_project=task.project
            )
            notified_users.add(assignee.id)
            
        if pm and pm.id not in notified_users:
            Notification.objects.create(
                user=pm,
                type='new_comment',
                message=message,
                related_task=task,
                related_project=task.project
            )
            notified_users.add(pm.id)

@receiver(post_save, sender=ProjectMember)
def project_member_post_save(sender, instance, created, **kwargs):
    if created:
        Notification.objects.create(
            user=instance.user,
            type='project_added',
            message=f"You have been added to project '{instance.project.name}'",
            related_project=instance.project
        )
