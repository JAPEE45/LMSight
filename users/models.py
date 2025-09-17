from django.db import models

from django.utils import timezone

class BaseModel(models.Model):
    createdAt = models.DateTimeField(auto_now_add = True)
    updatedAt = models.DateTimeField(auto_now = True)
    class Meta:
        abstract = True
    
class USERS(BaseModel):
    firstname = models.TextField(null=False)
    middlename = models.TextField(null=False)
    lastname = models.TextField(null=False)
    suffix = models.TextField(null=True)
    email = models.TextField(null=False)
    birthday = models.TextField(null=False)
    phone_number = models.TextField(null=False)
    picture = models.ImageField(upload_to="user_profile/", blank =True)
    department = models.TextField(null=False)
    job_title = models.TextField(null=False)
    employee_type = models.TextField(null=False)
    username = models.TextField(null=True)
    password = models.TextField(null=True)
    user_type = models.TextField(null=True)
    last_login = models.DateTimeField(null=True, blank=True)

    def update_login_time(self):
        """Update the last_login field whenever the user logs in"""
        self.last_login = timezone.now()
        self.save(update_fields=["last_login"])
    
class LEAVE_TYPES(BaseModel):
    leave_type = models.TextField(null=False)
    description = models.TextField(null=False)
    def __str__(self):
        return f'{self.leave_type}'

class LEAVE(BaseModel):
    users = models.ForeignKey(USERS, on_delete = models.CASCADE)
    leave_type = models.ForeignKey(LEAVE_TYPES, on_delete = models.CASCADE)
    commutation = models.TextField(blank=True)
    start_date = models.DateField(blank=True)
    end_date = models.DateField(blank=True)
    comment = models.TextField(blank=True)
    details_of_leave = models.TextField(blank=True)
    status = models.TextField(blank=True)
    def days_count(self):
        return int((self.end_date - self.start_date).days)
    def __str__(self):
        return f'{self.status} - {self.users.department} - {self.leave_type}'

class StatusNotif(BaseModel):
    user = models.ForeignKey(USERS, on_delete=models.CASCADE, related_name="from_admin")
    leave = models.ForeignKey(LEAVE, on_delete=models.CASCADE, related_name="LEAVEs", null=True)
    current_status = models.TextField(null=True)
    notif_type = models.TextField(null=True)
    