from django.urls import path
from . import views
urlpatterns = [
    path("",views.login, name="login" ),
    path("user/", views.user_dashboard, name="user_dasboard"),
    path("user/profile/", views.user_employee_profile, name="user_employee_profile"),
    path("user/omnibus/", views.user_omnibus, name="omnibus"),
    path("user/instructions/", views.user_instruction, name="instructions"),
    path("admin/", views.admin, name="admins"),
    path("admin/manage_users", views.admin_manage_users, name="admin_manage_users"),
    path("admin/edit_user", views.admin_edit_user, name="admin_edit_user"),
    path("logout/", views.logout, name="logout"),
    path("user/delete", views.delete_user, name="delete_user"),
    path("user/delete_selected", views.delete_selected_user, name="delete_selected"),
    # hr
    path("hr/", views.hr_dasboard, name="hr"),
    path("hr/request", views.hr_request, name="hr_request"),
    path("api/hr/request", views.getRequestFilter),
    path("api/hr/leave", views.getLeaveReq),
    path("api/hr/approved", views.approved_leave_request),
    path("api/hr/reject", views.rejected_leave_request),
    path("api/hr/ongoing", views.apiOngoing),
    path("api/user/delete", views.user_delete_leave),
    
    
]