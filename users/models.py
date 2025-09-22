from django.db import models
from django.utils import timezone
from decimal import Decimal
from datetime import datetime

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
    picture = models.ImageField(upload_to="user_profile/", blank=True)
    department = models.TextField(null=False)
    job_title = models.TextField(null=False)
    employee_type = models.TextField(null=False)
    username = models.TextField(null=True)
    password = models.TextField(null=True)
    user_type = models.TextField(null=True)
    credit = models.TextField(null=True, default="1.25")
    
    last_login = models.DateTimeField(null=True, blank=True)
    last_credit_update = models.DateTimeField(null=True, blank=True)  

    def update_login_time(self):
      
        self.last_login = timezone.now()
        self.save(update_fields=["last_login"])

    def add_monthly_credit(self):
        now = timezone.now()
        if not self.last_credit_update:
            self.credit = str(Decimal(self.credit) + Decimal("1.25"))
            self.last_credit_update = now
            self.save(update_fields=["credit", "last_credit_update"])
            return

        months_passed = (now.year - self.last_credit_update.year) * 12 + (now.month - self.last_credit_update.month)
        if months_passed >= 1:
            self.credit = str(Decimal(self.credit) + (Decimal("1.25") * months_passed))
            self.last_credit_update = now
            self.save(update_fields=["credit", "last_credit_update"])
    
class LEAVE_TYPES(BaseModel):
    leave_type = models.TextField(null=False)
    description = models.TextField(null=True)
    def __str__(self):
        return f'{self.leave_type}'

class LEAVE(BaseModel):
    users = models.ForeignKey(USERS, on_delete = models.CASCADE)
    leave_type = models.ForeignKey(LEAVE_TYPES, on_delete = models.CASCADE)
    commutation = models.TextField(blank=True)
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    comment = models.TextField(blank=True)
    details_of_leave = models.TextField(blank=True)
    number_of_days_applied = models.TextField(blank=True)
    inclusive_dates = models.TextField(blank=True)
    status = models.TextField(blank=True)
    specify = models.TextField(blank=True)
    
    def days_count(self):
        if self.start_date and self.end_date:
            if isinstance(self.start_date, str):
                start = datetime.strptime(self.start_date, "%Y-%m-%d").date()
            else:
                start = self.start_date

            if isinstance(self.end_date, str):
                end = datetime.strptime(self.end_date, "%Y-%m-%d").date()
            else:
                end = self.end_date

            return (end - start).days + 1
        return 0

    def __str__(self):
        return f'{self.status} - {self.users.department} - {self.leave_type.leave_type}'

class StatusNotif(BaseModel):
    user = models.ForeignKey(USERS, on_delete=models.CASCADE, related_name="from_admin")
    leave = models.ForeignKey(LEAVE, on_delete=models.CASCADE, related_name="LEAVEs", null=True)
    current_status = models.TextField(null=True)
    notif_type = models.TextField(null=True)

class LeaveTypeDetails(BaseModel):
    leave_types = models.ForeignKey(LEAVE_TYPES, on_delete = models.CASCADE)
    details = models.TextField(null = True)