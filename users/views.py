from django.shortcuts import render,redirect
from django.http import JsonResponse
from .models import USERS, LEAVE,StatusNotif, LEAVE_TYPES,LeaveTypeDetails
from django.utils import timezone
from django.utils.timezone import now
import datetime
from django.db.models import Q
import json
from django.forms.models import model_to_dict
from django.db.models.functions import ExtractMonth
from django.db.models import Count
import calendar
from django.urls import reverse
from django.db.models import Count, F


def credit(creditType, user, mult):
    print(mult)
    if mult == 0: mult = 1
    if user.credit  == '0.0':
        return False
    if creditType == "add":
        user.credit = str(float(user.credit) + (1.25)* float(mult))
        user.save()
    if creditType == "minus":
        user.credit = str(float(user.credit) - (1.25)* float(mult))
        user.save()
    return True
    
def get_monthly_leave_credits(user_id):
    try:
        user = USERS.objects.get(id=user_id)
        today = datetime.date.today()
        start_of_month = today.replace(day=1)
        if today.month == 12:
            end_of_month = today.replace(year=today.year+1, month=1, day=1) - datetime.timedelta(days=1)
        else:
            end_of_month = today.replace(month=today.month+1, day=1) - datetime.timedelta(days=1)
        leaves = LEAVE.objects.filter(
            users=user,
            status="approved",
            start_date__gte=start_of_month,
            end_date__lte=end_of_month
        )
        used_days = sum([leave.days_count() for leave in leaves])
        monthly_credit = 10
        remaining = monthly_credit - used_days

        return {
            "user": f"{user.firstname} {user.lastname}",
            "month": today.strftime("%B %Y"),
            "total_credits": monthly_credit,
            "used": used_days,
            "remaining": max(remaining, 0)
        }

    except USERS.DoesNotExist:
        return None
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
        usr.update_login_time()
        print(usr.firstname)
        if usr.user_type == "employee":
            request.session["user_id"] = usr.id
            return redirect("user_dasboard")
        elif usr.user_type == "admin":
            print("nasa admin")
            request.session["user_id"] = usr.id
            return redirect("admins")
        elif usr.user_type == "hr":
            print("nasa hr")
            request.session["user_id"] = usr.id
            return redirect("hr")
       
        
        
def get_status_notification():
    try:
        notif = StatusNotif.objects.filter(current_status="pending").order_by("-id")
        return notif
    except Exception as e:
        print(f"Error fetching notifications: {str(e)}")
        return StatusNotif.objects.none()

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
        specify = request.POST.get("specify")
        lt = LEAVE_TYPES.objects.filter(id = leave_type).first()
        
        lv = LEAVE(users=user, leave_type =  lt, comment = comment, start_date = start_date, end_date = end_date, commutation = commutation, status="pending", specify = specify)
        print(lv.days_count())
        if not credit("minus", user, lv.days_count()):
            url = reverse("user_dasboard")
            return redirect(f"{url}?error=true")
        lv.save()
        notif = StatusNotif(
           leave = lv, current_status = 'pending', user = user
        )
       
        
        notif.save()
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
                if i.status == "pending": user_leave["pending_leave"] +=1
                if i.status == "approved": approved.append(i)
                if i.status == "pending": pending.append(i)
                if i.status == "rejected": rejected.append(i)
                
            leave_balance = TOTAL_LEAVE - (user_leave["vacation_leave"] + user_leave["casual_leave"] + user_leave["sick_leave"]) 
            user_leave["total_leave_this_month"] = lv.count()
            user_leave["leave_balance"] = user.credit
            leave_status = {
                "approved": approved,
                "pending": pending,
                "rejected": rejected,
            }
            lt = LEAVE_TYPES.objects.all().values("id", "leave_type")
            print(lt)
            return render(request, "dashboard.html", {"user":user, "leave":user_leave,"leave_status": leave_status, "lt":lt })
        return render(request, "login_interface.html", {"error":True})

def user_employee_profile(request):
    if request.method == "GET":
        user_id = request.session.get("user_id")
        user = USERS.objects.filter(id=user_id).first()
        if not user:
            return redirect("login")
        return render(request, "emp_profile.html", {'user': user})
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
        notif = get_status_notification()
        all = {"dash":dashboard, "user_arr":user_arr, "users":users.order_by("-last_login"),  'user':user, "notif":notif}
        return render(request, "admin/dashboard.html",all)
def getLeaveTypes(request):
    if request.method == "GET":
        lt = LEAVE_TYPES.objects.all().values("leave_type","id")
        
        return JsonResponse({"lt":list(lt)})
def deleteLeaveType(request):
    if request.method == "GET":
        lt = LEAVE_TYPES.objects.filter(id = request.GET.get("leave_id")).first()
        if(lt):
            lt.delete()
            return JsonResponse({"success":True})
        return JsonResponse({"success":False})
def addLeaveType(request):
    if request.method == "POST":
        data = json.loads(request.body)
        leave_type = data.get("name")
        details = data.get("details")
        print(type(details))
        lt = LEAVE_TYPES(leave_type = leave_type)
        lt.save()
        for i in details:
            d = LeaveTypeDetails(leave_types = lt, details = i)
            d.save()
        return JsonResponse({"success":True})
def leave_types(request):
    if request.method == "GET":
        lt = LEAVE_TYPES.objects.all()
        user_id = request.session.get("user_id")
        user = USERS.objects.filter(id=user_id).first()
        if not user or user.user_type != "admin":
            return redirect("login")
        return render(request, 'admin/leave-types.html', {'lt':lt, "user":user})
    
def admin_manage_users(request):
    if request.method == "GET":
        user_id = request.session.get("user_id")
        user = USERS.objects.filter(id=user_id).first()
        if not user or user.user_type != "admin":
            return redirect("login")
        users = USERS.objects.all()
        notif = get_status_notification()
        return render(request, "admin/manage_users.html", {"users":users, "user_count":users.count(), 'user':user, "notif": notif})

def get_number(code: str) -> int:
    n = int(code[0])    
    number_str = code[1:1+n]
    return int(number_str)
def admin_edit_user(request):
    if request.method == "GET":
        user_id = request.session.get("user_id")
        user = USERS.objects.filter(id=user_id).first()
        if not user or user.user_type != "admin":
            return redirect("login")
        type_ = request.GET.get("type")
        if type_ == "edit":
            hash_ = request.GET.get("hash")
            id_ = get_number(hash_)
            edit_user = USERS.objects.filter(id=id_).first()
            if not edit_user:
                return redirect("admin_manage_users")
            
            return render(request, "admin/add_edit_user.html", {"usr":user,"user":edit_user})
        return render(request, "admin/add_edit_user.html", {"usr":user})
    if request.method == "POST":
        user_id = request.session.get("user_id")
        user = USERS.objects.filter(id=user_id).first()
        if not user or user.user_type != "admin":
            return redirect("login")
        post_type = request.GET.get("type")
        if post_type == "add":
            print("Add")
            firstname = request.POST.get("firstname")
            lastname = request.POST.get("lastname")
            middlename = request.POST.get("middlename")
            suffix = request.POST.get("suffix")
            email = request.POST.get("email")
            birthday = request.POST.get("birthday")
            phone_number = request.POST.get("phone_number")
            department = request.POST.get("department")
            job_title = request.POST.get("job_title")
            username = request.POST.get("username")
            password = request.POST.get("password")
            user_type = request.POST.get("user_type")
            picture = request.FILES['picture']
            employee_type = request.POST.get("employee_type")
            user = USERS(
                firstname = firstname, lastname = lastname, middlename = middlename,
                suffix = suffix, email = email, birthday = birthday,
                phone_number = phone_number, department = department,
                job_title = job_title, username = username, password = password,
                picture = picture, employee_type = employee_type, user_type = user_type                                                    
                
            )
            user.save()
            return redirect("admin_manage_users")
        if post_type == "edit":
            hash_ = request.GET.get("hash")
            id_ = get_number(hash_)
            user = USERS.objects.filter(id = id_).first()
            if not user: return redirect("admin_manage_users")
            firstname = request.POST.get("firstname")
            lastname = request.POST.get("lastname")
            middlename = request.POST.get("middlename")
            suffix = request.POST.get("suffix")
            email = request.POST.get("email")
            birthday = request.POST.get("birthday")
            phone_number = request.POST.get("phone_number")
            department = request.POST.get("department")
            job_title = request.POST.get("job_title")
            username = request.POST.get("username")
            password = request.POST.get("password")
            user_type = request.POST.get("user_type")
            employee_type = request.POST.get("employee_type")
            user.firstname = firstname
            user.lastname = lastname
            user.middlename = middlename
            user.suffix = suffix
            user.email = email
            user.birthday = birthday
            user.phone_number = phone_number
            user.department = department
            user.job_title = job_title
            user.username = username
            user.password = password
            user.user_type = user_type
            user.employee_type = employee_type
            if 'picture' in request.FILES:
                user.picture = request.FILES['picture']
            user.save()
            return redirect("admin_manage_users")
            
            
    return render(request, "admin/add_edit_user.html")

def delete_user(request):
    if request.method == "POST":
        print("hi")
        user_id = request.session.get("user_id")
        user = USERS.objects.filter(id = user_id).first()
        if user:
            usr = USERS.objects.filter(id = request.POST.get("user_id")).first()
            usr.delete()
            return redirect("admin_manage_users")
        return redirect("login")

def delete_selected_user(request):
    if request.method == "POST":
        cuser = request.session.get("user_id")
        if not cuser: return JsonResponse({'status':False})
        data = json.loads(request.body)
        ids = data.get("ids")
        for i in ids:
            us = USERS.objects.filter(id=i).first()
            if us: us.delete()
        return JsonResponse({'status':True})
def logout(request):
    if request.method == "GET":
        user_id = request.session.get("user_id")
        if user_id: 
            del request.session["user_id"]
            return redirect("login")
        return redirect("login")

def checkIfHr(request):
    usr_id =request.session.get("user_id")
    user = USERS.objects.filter(id = usr_id).first()
    if not user: 
        print("waran user")
        return False
    
    if user.user_type != 'hr':
        print("dili hr")
        return True
    print("hr ini")
    return False
    
def getWeeklyLeave():
    today = now().date()
    start_of_week = today - datetime.timedelta(days=today.weekday())  # Monday
    end_of_week = start_of_week + datetime.timedelta(days=6)  # Sunday

    weekly_leaves = LEAVE.objects.filter(
    start_date__gte=start_of_week,
    start_date__lte=end_of_week
    )
    days = [0,0,0,0,0,0,0]
    for i in weekly_leaves:
        if(i.start_date.strftime("%a") == "Mon"): days[0] += 1
        if(i.start_date.strftime("%a") == "Tue"): days[1] += 1
        if(i.start_date.strftime("%a") == "Wed"): days[2] += 1
        if(i.start_date.strftime("%a") == "Thu"): days[3] += 1
        if(i.start_date.strftime("%a") == "Fri"): days[4] += 1
        if(i.start_date.strftime("%a") == "Sat"): days[5] += 1
        if(i.start_date.strftime("%a") == "Sun"): days[6] += 1
    return days

def getLeaveByMonth(year=None):
    if year is None:
        year = now().year  # default: current year

    # group leaves by month number
    monthly_leaves = (
        LEAVE.objects.filter(start_date__year=year, status = "approved")
        .annotate(month=ExtractMonth('start_date'))
        .values('month')
        .annotate(total=Count('id'))
        .order_by('month')
    )

    # prepare array [Jan, Feb, ..., Dec]
    months = [0] * 12
    for m in monthly_leaves:
        months[m['month'] - 1] = m['total']

    return months
def getUpcomingLeaves():
    today = now().date()
    return LEAVE.objects.filter(start_date__gte=today).order_by('start_date')

def getOngoingLeaves():
    today = now().date()
    return LEAVE.objects.filter(
        status__iexact="approved",        # only approved
        start_date__lte=today,            # already started
        end_date__gte=today               # not yet ended
    ).order_by('end_date').values("users__firstname", "users__middlename", "users__lastname", "users__department","leave_type__leave_type","start_date","end_date")
def apiOngoing(request):
    if request.method == "GET":
        o = list(getOngoingLeaves())
        return JsonResponse({"o": o})
def getLeaveHistory():
    today = now().date()
    return LEAVE.objects.filter(
        status__iexact="approved",   # only approved
        end_date__lt=today           # already ended
    ).order_by('-end_date')       
    
def getLeaveCountByType():
    return (
        LEAVE.objects
        .values(type=F("leave_type__leave_type"))  
        .annotate(total=Count("id"))
        .order_by("-total")
    )   
    
def getLeaveCountByStatus():
    leave = LEAVE.objects.values('status').annotate(total=Count('id')).order_by('-total')
    arr = [0, 0, 0]

    for l in leave:
        if l['status'].lower() == 'pending': 
            arr[1] += l['total']
        if l['status'].lower() == 'approved': 
            arr[0] += l['total']
        if l['status'].lower() == 'rejected': 
            arr[2] += l['total']
    return arr

def getLeaveMatrix(lt):
    
    departments = ["HR", "IT", "Finance", "Operation"]
    matrix = []
    for leave_type in lt:
        row = [0] * len(departments)
        lv = LEAVE_TYPES.objects.filter(leave_type = leave_type).first()
        leave_counts = (
            LEAVE.objects.filter(leave_type=lv)
            .values("users__department")
            .annotate(total=Count("id"))
        )

        for l in leave_counts:
            dept = l["users__department"]
            if dept in departments:
                idx = departments.index(dept)
                row[idx] = l["total"]

        matrix.append(row)

    return matrix

def getLeaveDaysPerMonth(year=None):
    if year is None:
        year = now().year
    months = [0] * 12  

    leaves = LEAVE.objects.filter(
        start_date__year=year,
        end_date__year=year,
        status = "approved"
    )
    for leave in leaves:
        current = leave.start_date
        while current <= leave.end_date:
            if current.year == year:
                months[current.month - 1] += 1
            current += datetime.timedelta(days=1)

    return months
def getLeaveRequestsPerMonth(year=None):
    if year is None:
        year = now().year
    months = [0] * 12  
    monthly_counts = (
        LEAVE.objects.filter(start_date__year=year)
        .annotate(month=ExtractMonth('start_date'))
        .values('month')
        .annotate(total=Count('id'))
    )
    for m in monthly_counts:
        months[m['month'] - 1] = m['total']

    return months
def hr_dasboard(request):
    if request.method == "GET":
        if checkIfHr(request): return redirect("login")
        user = USERS.objects.filter(id = request.session.get("user_id")).first()
        print(user.firstname)
        s = {}
        s["weekly"] = getWeeklyLeave()
        s['monthly'] = getLeaveByMonth()
        s['upcoming'] = getUpcomingLeaves()
        s['user'] = user
       
        s['history'] = getLeaveHistory()
        b = getLeaveCountByType()
        lb = []
        val = []
        for i in b:
            lb.append(i['type'])
            val.append(i['total'])
        s['leave_type'] = json.dumps([lb, val])
     
        s['status'] = getLeaveCountByStatus()
        
        dep = getLeaveMatrix(lb)
        s['dep'] = dep
        s['perMonth'] = getLeaveRequestsPerMonth()
        s['all_leave'] = getLeaveDaysPerMonth()
        notif = get_status_notification()
        s['notif'] = notif
        # print(allLeave)
        return render(request, 'hr/dashboard.html',s )
def hr_request(request):
    if request.method == "GET":
        if checkIfHr(request): return redirect("login")
        user = USERS.objects.filter(id = request.session.get("user_id")).first()
        req = LEAVE.objects.filter(status = "pending")
        dt = list(req)
        print(dt)
        notif = get_status_notification()
        return render(request, 'hr/requests.html', {'user':user, 'request':dt, "notif" : notif})

def getRequestFilter(request):
    if request.method == "POST":
        body = json.loads(request.body) 
        department = body.get("department") 
        leave_type = body.get("leave_type") 
        val = ""
        print(department)
        if department and leave_type:
            print("dep and leave type")
            val = LEAVE.objects.filter(users__department = department, status = "pending", leave_type = leave_type)
        elif department:
            print("dep only")
            print(department)
            val = LEAVE.objects.filter(users__department = department, status = "pending")
        elif leave_type:
            print(" leave type only")
            val = LEAVE.objects.filter(leave_type = leave_type, status = "pending")
        else:
            val = LEAVE.objects.all()
        val = val.values("id","users__firstname", "users__middlename", "users__lastname", "leave_type", "start_date", "end_date", "createdAt", "users__department")
        return JsonResponse({"request": list(val)})


def getLeaveReq(request):
    if request.method == "GET":
        id = request.GET.get("id")
        leave = LEAVE.objects.filter(id = id).first()
        credit = get_monthly_leave_credits(leave.users.id)
        lv = model_to_dict(leave)
        lv["fullname"] = f'{leave.users.firstname} {leave.users.middlename} {leave.users.lastname}'
        lv["job_title"] = leave.users.job_title
        lv["department"] = leave.users.department
        lv["picture"] = leave.users.picture.url
        lv["credit"] = credit
        if leave: return JsonResponse({"leave":lv })
        return JsonResponse({"message": "no leave"})

def approved_leave_request(request):
    if request.method == "GET":
         if checkIfHr(request): return redirect("login")
         id = request.GET.get("id")
         print(id)
         c = LEAVE.objects.filter(id = id).first()
         if not c:  return JsonResponse({"message":"data does not exist"})
         c.status = "approved"
         c.save()
         return JsonResponse({"status":True})
     
         
def rejected_leave_request(request):
    if request.method == "GET":
            if checkIfHr(request): return redirect("login")
            id = request.GET.get("id")
            c = LEAVE.objects.filter(id = id).first()
            if not c:  return JsonResponse({"message":"data does not exist"})
            c.status = "rejected"
            c.save()
            return JsonResponse({"status":True})
        
     
def user_delete_leave(request):
    if request.method == "GET":
        id = request.GET.get("id")
        lv = LEAVE.objects.filter(id = id).first()
        lv.delete()
        return JsonResponse({"status":True})

def getDetails(request):
    if request.method == "GET":
        id = request.GET.get("id")
        d = LeaveTypeDetails.objects.filter(leave_types=id).values("id", "details")
        return JsonResponse({"dt":list(d)})