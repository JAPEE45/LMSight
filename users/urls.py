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
    
]