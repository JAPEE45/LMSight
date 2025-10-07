from django.shortcuts import render,redirect
from django.http import JsonResponse
from .models import USERS, LEAVE,StatusNotif, LEAVE_TYPES,LeaveTypeDetails
from django.utils import timezone
from django.utils.timezone import now
# import datetime
from datetime import datetime, timedelta, date
from django.utils.dateformat import DateFormat
from django.db.models import Q
import json
from django.forms.models import model_to_dict
from django.db.models.functions import ExtractMonth
from django.db.models import Count
import calendar
from django.db.models import Sum
from django.urls import reverse
from django.db.models import Count, F
import re

def credit(creditType, user, mult):
    if mult <= 0: mult = 1.0

    try:
        current_credit = float(user.credit)
    except (ValueError, TypeError):
        current_credit = 0.0

    change_amount = float(mult)

    if creditType == "add":
        user.credit = str(current_credit + change_amount)
        user.save(update_fields=["credit"])
        return True

    elif creditType == "minus":
        if current_credit >= change_amount:
            user.credit = str(current_credit - change_amount)
            user.save(update_fields=["credit"])
            return True
        else:
            print(f"Not enough credit: current={current_credit}, deduct={change_amount}")
            return False

    return False
    # print(mult)
    # if mult == 0: mult = 1
    # if user.credit  == '0.0':
    #     return False
    # if creditType == "add":
    #     user.credit = str(float(user.credit) + (1.25)* float(mult))
    #     user.save()
    # if creditType == "minus":
    #     user.credit = str(float(user.credit) - (1.25)* float(mult))
    #     user.save()
    # return True


def get_monthly_leave_credits(user_id):
    try:
        user = USERS.objects.get(id=user_id)
        today = date.today()

        # Define start and end of month
        start_of_month = today.replace(day=1)
        if today.month == 12:
            end_of_month = today.replace(year=today.year + 1, month=1, day=1) - timedelta(days=1)
        else:
            end_of_month = today.replace(month=today.month + 1, day=1) - timedelta(days=1)

        # Get approved leaves for this month
        leaves = LEAVE.objects.filter(
            users=user,
            status="approved",
            start_date__gte=start_of_month,
            end_date__lte=end_of_month
        )

        # Sum days from all approved leaves
        used_days = sum([leave.days_count() for leave in leaves])

        # Calculate remaining
        remaining = TOTAL_LEAVE - used_days
        remaining = max(remaining, 0)  # avoid negative

        # Calculate percentages
        used_percent = (used_days / TOTAL_LEAVE) * 100 if TOTAL_LEAVE else 0
        remaining_percent = (remaining / TOTAL_LEAVE) * 100 if TOTAL_LEAVE else 0

        return {
            "user": f"{user.firstname} {user.lastname}",
            "month": today.strftime("%B %Y"),
            "total_credits": TOTAL_LEAVE,
            "used": used_days,
            "remaining": remaining,
            "used_percent": round(used_percent, 2),
            "remaining_percent": round(remaining_percent, 2),
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
        # print(f"p: {password} || e: {username}")
        usr = USERS.objects.filter(username = username, password = password).first()
       
        if not usr:
            return render(request, "login_interface.html", {"error":True})
        usr.update_login_time()
        if usr.user_type == "employee":
            request.session["user_id"] = usr.id
            return redirect("user_dasboard")
        elif usr.user_type == "admin":
            request.session["user_id"] = usr.id
            return redirect("admins")
        elif usr.user_type == "hr":
            request.session["user_id"] = usr.id
            return redirect("hr")    
        
def get_status_notification():
    try:
        notif = StatusNotif.objects.filter(current_status="pending").order_by("-id")
        return notif
    except Exception as e:
        return StatusNotif.objects.none()
    
def user_dashboard(request):
    if request.method == "POST":
        user_id = request.session.get("user_id")
        user = USERS.objects.filter(id=user_id).first()
        if not user:
            return redirect("login")

        leave_type = request.POST.get("leave_type")
        attached_file = request.FILES.get("attached-file")
        number_of_working_days = request.POST.get("number_of_working_days")
        inclusive_dates = request.POST.get("inclusive-dates")
        commutation = request.POST.get("commutation")
        specify = request.POST.get("specify")

        parts = [p.strip() for p in inclusive_dates.split(",") if p.strip()]
        print(parts)

        if len(parts) < 2:
            return redirect(f"{reverse('user_dasboard')}?error=invalid_dates")

        # If only one date was entered → use same for start and end
        if len(parts) == 2:
            start_str = end_str = ", ".join(parts[:2])
        else:
            # Use first 2 parts for start, last 2 parts for end
            start_str = ", ".join(parts[:2])     # "OCTOBER 10, 2025"
            end_str   = ", ".join(parts[-2:])    # "OCTOBER 15, 2025"

        print("Start:", start_str)
        print("End:", end_str)

        try:
            start_date = datetime.strptime(start_str, "%B %d, %Y").date()
            end_date   = datetime.strptime(end_str, "%B %d, %Y").date()
        except ValueError:
            return redirect(f"{reverse('user_dasboard')}?error=invalid_dates")

        lt = LEAVE_TYPES.objects.filter(id=leave_type).first()
        if not lt:
            return redirect(f"{reverse('user_dasboard')}?error=invalid_leave_type")

        ld = LeaveTypeDetails.objects.filter(leave_types=lt).first()

        lv = LEAVE(
            users=user,
            leave_type=lt,
            leave_details=ld,
            commutation=commutation,
            attached_file=attached_file,
            number_of_days_applied=number_of_working_days,
            start_date=start_date,
            end_date=end_date,
            status="pending",
            specify=specify
        )
        lv.save()

        notif = StatusNotif(
            leave=lv,
            current_status='pending',
            user=user
        )
        notif.save()
        return redirect("user_dasboard")

    if request.method == "GET":
        usr = request.session.get("user_id")
        if not usr:
            return redirect("login")

        user = USERS.objects.filter(id=usr).first()
        if not user:
            return render(request, "login_interface.html", {"error": True})

        today = timezone.now().date()
        lv = LEAVE.objects.filter(users=user, start_date__month=today.month)

        # Initialize leave summary
        user_leave = {
            "vacation_leave": 0,
            "casual_leave": 0,
            "sick_leave": 0,
            "pending_leave": 0
        }

        approved = []
        rejected = []
        pending = []

        total_leave_days_this_month = 0

        # Loop through leaves to summarize
        for leave in lv:
            if leave.status == "pending":
                user_leave["pending_leave"] += 1
                pending.append(leave)

            elif leave.status == "approved":
                approved.append(leave)
                days = int(leave.number_of_days_applied)
                total_leave_days_this_month += days

                leave_type_lower = leave.leave_type.leave_type.lower()
                if leave_type_lower == "vacation":
                    user_leave["vacation_leave"] += days
                elif leave_type_lower == "casual":
                    user_leave["casual_leave"] += days
                elif leave_type_lower == "sick":
                    user_leave["sick_leave"] += days

            elif leave.status == "rejected":
                rejected.append(leave)

        # Show total approved leave days and current credit
        user_leave["total_leave_this_month"] = total_leave_days_this_month
        user_leave["leave_balance"] = float(user.credit)

        leave_status = {
            "approved": approved,
            "pending": pending,
            "rejected": rejected,
        }

        lt = LEAVE_TYPES.objects.all().values("id", "leave_type")

        return render(request, "dashboard.html", {
            "user": user,
            "leave": user_leave,
            "leave_status": leave_status,
            "lt": lt
        })

    
def security(request):
    if request.method == "GET":
        user_id = request.session.get("user_id")
        user = USERS.objects.filter(id=user_id).first()

        return render(request, "security.html", {'user': user})
    
def change_password(request):
    user_id = request.session.get("user_id")
    user = USERS.objects.filter(id=user_id).first()

    if not user:
        return JsonResponse({"status": False, "msg": "User not logged in"})

    if request.method == "POST":
        current_password = request.POST.get("current-password")
        new_password = request.POST.get("new-password")
        confirm_password = request.POST.get("confirm-password")

        # Validate current password
        if current_password != user.password:
            return JsonResponse({"status": False, "msg": "Current password is incorrect"})

        if new_password != confirm_password:
            return JsonResponse({"status": False, "msg": "New password and confirm password do not match"})

        user.password = new_password
        user.save()

        return JsonResponse({"status": True, "msg": "Password changed successfully"})
    
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
        # print("waran user")
        return False
    
    if user.user_type != 'hr':
        # print("dili hr")
        return True
    return False
    
def getWeeklyLeave():
    today = now().date()
    start_of_week = today - timedelta(days=today.weekday())  # Monday
    end_of_week = start_of_week + timedelta(days=6)  # Sunday

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
            current += timedelta(days=1)

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

def get_user_leave_string(user_id):
    try:
        user = USERS.objects.get(id=user_id)
        leaves = LEAVE.objects.filter(users=user).order_by("start_date")

        leave_strings = []

        for leave in leaves:
            if leave.start_date and leave.end_date:
                start_day = leave.start_date.day
                end_day = leave.end_date.day
                month = leave.start_date.month   # ✅ safe for Windows
                year = leave.start_date.year     # ✅ safe for Windows

                if start_day == end_day:
                    # Single day leave
                    leave_strings.append(f"{month}/{start_day}/{year}")
                else:
                    # Date range leave
                    leave_strings.append(f"{month}/{start_day}-{end_day}/{year}")

        return "; ".join(leave_strings)

    except USERS.DoesNotExist:
        return ""

def hr_request(request):
    if request.method == "GET":
        if checkIfHr(request): return redirect("login")
        user = USERS.objects.filter(id = request.session.get("user_id")).first()
        req = LEAVE.objects.filter(status = "pending")
        dt = list(req)
        # for i in dt:
        #     print("requests ini: ",i.leave_details.details)
        notif = get_status_notification()
        return render(request, 'hr/requests.html', {'user':user, 'request':dt, "notif" : notif})
    

def hr_emp_profile(request, userID):
    if request.method == "GET":
        emp = USERS.objects.filter(id = userID).first()
        # emp_leave = LEAVE.objects.filter(users = emp).first()
        hr = USERS.objects.filter(id = request.session.get("user_id")).first()
        notif = get_status_notification()
        emp = USERS.objects.filter(id=userID).first()
        total_leave_days = LEAVE.objects.filter(users=emp, status="approved").aggregate(
        total=Sum('number_of_days_applied')
        )['total'] or 0
        
        return render(
    request,
    "hr/emp_profile.html",
    {
        "hr": hr,
        "user": emp,
        "notif": notif,
        "leave_credits": get_monthly_leave_credits(userID),
        "leave_dates": get_user_leave_string(userID),  # fixed spelling
    }
)



def month_range(start_date, end_date):
    """Yield first day of each month from start_date to end_date."""
    current = start_date.replace(day=1)
    while current <= end_date:
        yield current
        if current.month == 12:
            current = current.replace(year=current.year + 1, month=1)
        else:
            current = current.replace(month=current.month + 1)

def leave_ledger(request, user_id):
    if request.method == "GET":
        # Fetch employee
        employee = USERS.objects.filter(id=user_id).first()
        if not employee:
            return JsonResponse({"error": "Employee not found"}, status=404)

        # Get employee's leaves
        leaves = LEAVE.objects.filter(users=employee).order_by("start_date")

        ledger_rows = []
        vacation_balance = 0
        sick_balance = 0

        VACATION_ACCRUAL = 1.25
        SICK_ACCRUAL = 1.25

        start_date = leaves.first().start_date if leaves.exists() else date.today()
        end_date = date.today()
        
        # iterate monthly
        for month in month_range(start_date, end_date):
            period = DateFormat(month).format("m/Y")

            earned_vl = VACATION_ACCRUAL
            earned_sl = SICK_ACCRUAL
            vacation_balance += earned_vl
            sick_balance += earned_sl

            month_start = date(month.year, month.month, 1)
            last_day = calendar.monthrange(month.year, month.month)[1]
            month_end = date(month.year, month.month, last_day)

            month_leaves = leaves.filter(
                Q(start_date__lte=month_end) & Q(end_date__gte=month_start)
            )

            absent_vl = absent_sl = 0
            absent_without_vl = absent_without_sl = 0
            remarks = ""

            for leave in month_leaves:
                leave_type = leave.leave_type.leave_type.upper() if leave.leave_type else "N/A"
                days_with_pay = 0
                days_without_pay = 0

                if leave.approved_for:
                    if "with pay" in leave.approved_for.lower():
                        match = re.search(r"\d+", leave.approved_for)
                        days_with_pay = int(match.group()) if match else 0
                    elif "without pay" in leave.approved_for.lower():
                        match = re.search(r"\d+", leave.approved_for)
                        days_without_pay = int(match.group()) if match else 0

                if leave_type == "VL":
                    absent_vl += days_with_pay
                    vacation_balance -= days_with_pay
                    absent_without_vl += days_without_pay
                elif leave_type == "SL":
                    absent_sl += days_with_pay
                    sick_balance -= days_with_pay
                    absent_without_sl += days_without_pay

                if leave.status == "approved":
                    remarks += f"{leave_type} Availed {days_with_pay}d w/ pay, {days_without_pay}d w/o pay. "
                if leave.date_of_action:
                    remarks += f"({leave.date_of_action}) "

            ledger_rows.append({
                "period": period,
                "particulars": {
                    "type": "VL/SL",
                    "days": absent_vl + absent_sl + absent_without_vl + absent_without_sl,
                    "hrs": 0,
                    "mins": 0,
                },
                "vacation_leave": {
                    "earned": earned_vl,
                    "absent_with_pay": absent_vl,
                    "balance": round(vacation_balance, 3),
                    "absent_without_pay": absent_without_vl,
                },
                "sick_leave": {
                    "earned": earned_sl,
                    "absent_with_pay": absent_sl,
                    "balance": round(sick_balance, 3),
                    "absent_without_pay": absent_without_sl,
                },
                "remarks": remarks or "Monthly accrual"
            })

        # Add employee info to the response
        employee_info = {
            "full_name": f"{employee.firstname} {employee.middlename} {employee.lastname}" + (f" {employee.suffix}" if employee.suffix else ""),
            "department": employee.department,
            "created_at": employee.createdAt.strftime("%Y-%m-%d %H:%M:%S")
        }

        return JsonResponse({
            "employee": employee_info,
            "ledger": ledger_rows
        })


def getRequestFilter(request):
    if request.method == "POST":
        body = json.loads(request.body) 
        department = body.get("department") 
        leave_type = body.get("leave_type") 
        val = ""
        if department and leave_type:
            
            val = LEAVE.objects.filter(users__department = department, status = "pending", leave_type = leave_type)
        elif department:
            
            print(department)
            val = LEAVE.objects.filter(users__department = department, status = "pending")
        elif leave_type:
            val = LEAVE.objects.filter(leave_type = leave_type, status = "pending")
        else:
            val = LEAVE.objects.all()
        val = val.values("id","users__firstname", "users__middlename", "users__lastname", "leave_type", "start_date", "end_date", "createdAt", "users__department")
        return JsonResponse({"request": list(val)})


def getLeaveReq(request):
    if request.method == "GET":
        # id = request.GET.get("id")
        # leave = LEAVE.objects.filter(id = id).first()
        # credit = get_monthly_leave_credits(leave.users.id)
        # lv = model_to_dict(leave)
        # lv["fullname"] = f'{leave.users.firstname} {leave.users.middlename} {leave.users.lastname}'
        # lv["job_title"] = leave.users.job_title
        # lv["department"] = leave.users.department
        # lv["picture"] = leave.users.picture.url
        # lv["credit"] = credit
        # if leave: return JsonResponse({"leave":lv })
        # return JsonResponse({"message": "no leave"})
        leave_id = request.GET.get("id")
        leave = LEAVE.objects.filter(id=leave_id).select_related("users", "leave_type", "leave_details").first()

        credit = get_monthly_leave_credits(leave.users.id)

        lv = model_to_dict(leave)

        if "attached_file" in lv:
            lv["attached_file"] = leave.attached_file.url if leave.attached_file else None

        lv["fullname"] = f"{leave.users.firstname} {leave.users.middlename} {leave.users.lastname}"
        lv["job_title"] = leave.users.job_title
        lv["department"] = leave.users.department
        lv["picture"] = leave.users.picture.url if leave.users.picture else None
        lv["credit"] = credit

        lv["leave_type"] = leave.leave_type.leave_type
        lv["leave_details"] = leave.leave_details.details

        return JsonResponse({"leave": lv})


def action(request):
    if request.method == "POST":
        leave_id = request.POST.get("id")
        recommendationAction = request.POST.get("actionOnLeave")
        disapprovalReason1 = request.POST.get("disapprovalReason1")
        disapprovalReason2 = request.POST.get("disapprovalReason2")
        date_of_action = request.POST.get("date_of_action")
        approved_days = request.POST.get("approved_disapproved_days")
        
        leave = LEAVE.objects.filter(id=leave_id).first()
        if not leave:
            print("Leave not found for id:", leave_id)
            return redirect("hr_request")
        
        # Update leave fields
        leave.recommendation_for = recommendationAction
        leave.recommendation_for_disapproval_due_to = disapprovalReason1
        leave.approved_for = approved_days
        leave.disapproved_due_to = disapprovalReason2
        leave.date_of_action = date_of_action

        if disapprovalReason2 == "" and approved_days:
            # Only deduct credit if the leave is not already approved
            if leave.status != "approved":
                leave.status = "approved"
                print(leave.users)
                credit("minus", leave.users, leave.days_count())
        elif disapprovalReason2 != "":
            leave.status = "rejected"
        
        # Approve or reject
        if disapprovalReason2 == "" and approved_days:
            if leave.status != "approved":
                leave.status = "approved"
                # Deduct leave credit based on actual inclusive days
                deducted = credit("minus", leave.users, leave.days_count())
                if deducted:
                    print(f"Deducted {leave.days_count()} days from {leave.users.firstname}'s credit.")
                else:
                    print(f"Could not deduct credit for {leave.users.firstname}. Not enough balance.")
        elif disapprovalReason2 != "":
            leave.status = "rejected"

        leave.save()  # Save all changes at once

        print("User credit after:", leave.users.credit)

        return redirect("hr_request")

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