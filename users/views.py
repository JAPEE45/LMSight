from django.shortcuts import render,redirect
from .models import USERS, LEAVE
from django.utils import timezone
from django.db.models import Q
# Create your views here.

TOTAL_LEAVE = 10
def login(request):
    if request.method == "GET":
        return render(request, "login_interface.html")
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")
        print(f"p: {password} || e: {username}")
        usr = USERS.objects.filter(username = username, password = password).first()
        if not usr:
            print("wrong passsword")
            return render(request, "login_interface.html", {"error":True})
        if usr.user_type == "employee":
            request.session["user_id"] = usr.id
            return redirect("user_dasboard")
        if usr.user_type == "admin":
            print("nasa admin")
            request.session["user_id"] = usr.id
            return redirect("admins")
        if not usr:
            print("wrong passsword")
            return render(request, "login_interface.html", {"error":True})
        
        

def user_dashboard(request):
    if request.method == "POST":
        user_id = request.session["user_id"]
        user = USERS.objects.filter(id=user_id).first()
        if not user:
            return redirect("login")
        leave_type = request.POST.get("leave_type")
        comment = request.POST.get("comment")
        start_date = request.POST.get("start_date")
        end_date = request.POST.get("end_date")
        commutation = request.POST.get("commutation")
        lv = LEAVE(users=user, leave_type = leave_type, comment = comment, start_date = start_date, end_date = end_date, commutation = commutation, status="pending")
        lv.save()
        return redirect("user_dasboard")
    if request.method == "GET":
        usr = request.session.get("user_id")
        if not usr: return redirect("login")
        user = USERS.objects.filter(id=usr).first()
        if user:
            today = timezone.now().date()
            lv = LEAVE.objects.filter(users = user, start_date__month = today.month)
            user_leave = {"vacation_leave": 0, "casual_leave": 0, "sick_leave":0, "pending_leave":0}
            approved = []
            rejected = []
            pending = []
            for i in lv:

                if i.leave_type == "vacation leave" and i.status != "rejected": user_leave["vacation_leave"] += i.days_count()
                if i.leave_type == "casual leave" and i.status != "rejected": user_leave["casual_leave"] += i.days_count()
                if i.leave_type == "sick leave" and i.status != "rejected": user_leave["sick_leave"] += i.days_count()
                if i.status == "pending": user_leave["pending_leave"] +=1
                if i.status == "approved": approved.append(i)
                if i.status == "pending": pending.append(i)
                if i.status == "rejected": rejected.append(i)
                
            leave_balance = TOTAL_LEAVE - (user_leave["vacation_leave"] + user_leave["casual_leave"] + user_leave["sick_leave"]) 
            user_leave["total_leave_this_month"] = lv.count()
            user_leave["leave_balance"] = leave_balance
            leave_status = {
                "approved": approved,
                "pending": pending,
                "rejected": rejected,
            }
            return render(request, "dashboard.html", {"user":user, "leave":user_leave,"leave_status": leave_status })
        return render(request, "login_interface.html", {"error":True})

def user_employee_profile(request):
    if request.method == "GET":
        user_id = request.session.get("user_id")
        user = USERS.objects.filter(id=user_id).first()
        if not user:
            return redirect("login")
        return render(request, "emp_profile.html")
def user_omnibus(request):
    if request.method == "GET":
        user_id = request.session.get("user_id")
        user = USERS.objects.filter(id=user_id).first()
        if not user:
            return redirect("login")
        return render(request, "omnibus_interface.html")
def user_instruction(request):
    if request.method == "GET":
        user_id = request.session.get("user_id")
        user = USERS.objects.filter(id=user_id).first()
        if not user:
            return redirect("login")
        return render(request, "instructions.html")

 # -> [10,0 10] : para sa graph
def count_user_type(user) -> []:
    arr = [0,0,0]
    for s in user:
        if s.user_type == "employee": arr[0] +=1
        if s.user_type == "hr": arr[1] +=1
        if s.user_type == "admin": arr[2] +=1
    total = user.count()
    arr[0] = (arr[0] /total) *100 # employee 
    arr[1] = (arr[1] /total) *100 # hr
    arr[2] = (arr[2] /total) *100 # admin
    return arr
def admin(request):
    if request.method == "GET":
        user_id = request.session.get("user_id")
        user = USERS.objects.filter(id=user_id).first()
        if not user or user.user_type != "admin":
            return redirect("login")
        
        users = USERS.objects.all()
        today = timezone.now().date()
        leave = LEAVE.objects.filter(start_date__month = today.month)
        
        user_arr = count_user_type(users)
        dashboard = {"total_user":users.count(), "leave_types": 10, "total_leave_request":leave.count()}
        return render(request, "admin/dashboard.html",{"dash":dashboard, "user_arr":user_arr})
def admin_manage_users(request):
    if request.method == "GET":
        user_id = request.session.get("user_id")
        user = USERS.objects.filter(id=user_id).first()
        if not user or user.user_type != "admin":
            return redirect("login")
        return render(request, "admin/manage_users.html")
def admin_edit_user(request):
    if request.method == "GET":
        user_id = request.session.get("user_id")
        user = USERS.objects.filter(id=user_id).first()
        if not user or user.user_type != "admin":
            return redirect("login")
        return render(request, "admin/add_edit_user.html")

def logout(request):
    if request.method == "GET":
        user_id = request.session.get("user_id")
        if user_id: 
            del request.session["user_id"]
            return redirect("login")
        return redirect("login")