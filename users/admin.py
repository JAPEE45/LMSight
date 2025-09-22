from django.contrib import admin
from . import models
# Register your models here.
admin.site.register(models.USERS)
admin.site.register(models.LEAVE)
admin.site.register(models.StatusNotif)
admin.site.register(models.LEAVE_TYPES)
admin.site.register(models.LeaveTypeDetails)