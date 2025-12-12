from django.shortcuts import render,redirect
from django.http import JsonResponse
from .models import USERS, LEAVE,StatusNotif, LEAVE_TYPES,LeaveTypeDetails, UserMonthlyBalance
from django.utils import timezone
from django.utils.timezone import now
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
from users.email_utils import send_email_notification

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
        
        GLOBAL_MONTHLY_LIMIT = 10.0

        today = date.today()
        start_of_month = today.replace(day=1)
        if today.month == 12:
            end_of_month = today.replace(year=today.year + 1, month=1, day=1) - timedelta(days=1)
        else:
            end_of_month = today.replace(month=today.month + 1, day=1) - timedelta(days=1)

        # Calculate used days this month
        leaves = LEAVE.objects.filter(
            users=user,
            status="approved",
            start_date__gte=start_of_month,
            end_date__lte=end_of_month
        )

        used_days = sum([leave.days_count() for leave in leaves])
        
        remaining = max(0, GLOBAL_MONTHLY_LIMIT - used_days)

        # Total credits is the limit
        total_credits = GLOBAL_MONTHLY_LIMIT
        
        if total_credits > 0:
            used_percent = (used_days / total_credits) * 100
            remaining_percent = (remaining / total_credits) * 100
        else:
            used_percent = 0
            remaining_percent = 0

        return {
            "user": f"{user.firstname} {user.lastname}",
            "month": today.strftime("%B %Y"),
            "total_credits": total_credits, 
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
        usr = USERS.objects.filter(username = username, password = password).first()
        print(username)
        print(password)
        print(usr)
        if not usr:
            print(usr)
            return render(request, "login_interface.html", {"error":True})
        usr.update_login_time()
        if usr.user_type == "employee":
            request.session["user_id"] = usr.id
            return redirect("user_dasboard")
        elif usr.user_type == "admin":
            request.session["user_id"] = usr.id
            return redirect("admins")
        elif usr.user_type == "supervisor":
            print('sypervisor ini')
            request.session["user_id"] = usr.id
            return redirect("supervisor")
        elif usr.user_type == "mayor":   
            print('mayor ini')
            request.session["user_id"] = usr.id
            return redirect("mayor")
        elif usr.user_type == "hr":
            request.session["user_id"] = usr.id
            return redirect("hr")    
        
def get_status_notification(current_status=None):
    try:
        if current_status:
            notif = StatusNotif.objects.filter(current_status=current_status).order_by("-id")
        else:
            notif = StatusNotif.objects.all().order_by("-id")
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
        # number_of_working_days is calculated from dates
        start_date_str = request.POST.get("start_date")
        end_date_str = request.POST.get("end_date")
        commutation = request.POST.get("commutation")
        specify = request.POST.get("specify")
        details = request.POST.get("details")

        if not start_date_str or not end_date_str:
             return redirect(f"{reverse('user_dasboard')}?error=missing_dates")

        try:
            start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()
            end_date   = datetime.strptime(end_date_str, "%Y-%m-%d").date()
        except ValueError:
            return redirect(f"{reverse('user_dasboard')}?error=invalid_dates")

        if start_date > end_date:
             return redirect(f"{reverse('user_dasboard')}?error=invalid_range")

        lt = LEAVE_TYPES.objects.filter(id=leave_type).first()
        if not lt:
            return redirect(f"{reverse('user_dasboard')}?error=invalid_leave_type")

        ld = LeaveTypeDetails.objects.filter(id=details, leave_types=lt).first()
        print(ld)

        number_of_days_applied = (end_date - start_date).days + 1

        lv = LEAVE(
            users=user,
            leave_type=lt,
            leave_details=ld,
            commutation=commutation,
            attached_file=attached_file,
            number_of_days_applied=number_of_days_applied,
            start_date=start_date,
            end_date=end_date,
            status="pending_hr",
            specify=specify
        )
        lv.save()

        notif = StatusNotif(
            leave=lv,
            current_status='pending_hr',
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
        lv = LEAVE.objects.filter(users=user).order_by('-createdAt')

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

        for leave in lv:
            # Check if leave is in current month/year for stats
            is_this_month = False
            if leave.start_date and leave.start_date.month == today.month and leave.start_date.year == today.year:
                is_this_month = True

            if leave.status in ["pending", "pending_hr", "pending_mayor"]:
                user_leave["pending_leave"] += 1
                pending.append(leave)

            elif leave.status == "approved":
                approved.append(leave)
                
                if is_this_month:
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

        user_leave["total_leave_this_month"] = total_leave_days_this_month
        
        GLOBAL_MONTHLY_LIMIT = 10.0
        user_leave["leave_balance"] = max(0, GLOBAL_MONTHLY_LIMIT - total_leave_days_this_month)

        leave_status = {
            "approved": approved,
            "pending": pending,
            "rejected": rejected,
        }

        lt = LEAVE_TYPES.objects.all().values("id", "leave_type")
        notif = StatusNotif.objects.filter(user=user)

        return render(request, "dashboard.html", {
            "user": user,
            "leave": user_leave,
            "leave_status": leave_status,
            "lt": lt,
            "notif": notif
        })

def security(request):
    if request.method == "GET":
        user_id = request.session.get("user_id")
        user = USERS.objects.filter(id=user_id).first()

        return render(request, "security.html", {'user': user})

def hr_security(request):
    if request.method == "GET":
        user_id = request.session.get("user_id")
        user = USERS.objects.filter(id=user_id).first()

        return render(request, "hr/security.html", {'user': user})

def supervisor_security(request):
    if request.method == "GET":
        user_id = request.session.get("user_id")
        user = USERS.objects.filter(id=user_id).first()

        return render(request, "supervisor/security.html", {'user': user})

def mayor_security(request):
    if request.method == "GET":
        user_id = request.session.get("user_id")
        user = USERS.objects.filter(id=user_id).first()

        return render(request, "mayor/security.html", {'user': user})


def change_password(request):
    user_id = request.session.get("user_id")
    user = USERS.objects.filter(id=user_id).first()
    print("received: ", user)
    if not user:
        return JsonResponse({"status": False, "msg": "User not logged in"})

    if request.method == "POST":
        current_password = request.POST.get("current-password")
        new_password = request.POST.get("new-password")
        confirm_password = request.POST.get("confirm-password")

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

def recalculate_monthly_balances(user, year, month):
    # 1. Global Monthly Limit
    GLOBAL_MONTHLY_LIMIT = 10

    # 2. Per-Type Limits
    TYPE_LIMITS = {
        "Vacation": 10,
        "Sick": 10,
        "Maternity": 10,
        "Paternity": 10,
        "Special Privilege": 10,
        "Solo Parent": 10,
        "Study": 10,
        "VAWC": 10,
        "Special Emergency": 10
    }

    # 3. Fetch all approved leaves for the target month
    leaves_this_month = LEAVE.objects.filter(
        users=user,
        status="approved",
        start_date__month=month,
        start_date__year=year
    )

    # 4. Calculate Usages
    total_used_this_month = 0
    type_usage = {k: 0 for k in TYPE_LIMITS.keys()}

    for l in leaves_this_month:
        days = l.days_count()
        total_used_this_month += days
        
        # Identify type
        l_type_name = l.leave_type.leave_type
        for key in TYPE_LIMITS:
            if key.lower() in l_type_name.lower():
                type_usage[key] += days
                break
    
    # 5. Calculate Global Remaining
    global_remaining = max(0, GLOBAL_MONTHLY_LIMIT - total_used_this_month)

    # 6. Update/Create UserMonthlyBalance entries
    for name, type_limit in TYPE_LIMITS.items():
        # Find matching LEAVE_TYPE object
        # Note: This relies on LEAVE_TYPES having names matching keys or subsets. 
        # Ideally we fetch the ID. For now, we search by string matching which is brittle but consistent with current app logic.
        lt_obj = LEAVE_TYPES.objects.filter(leave_type__icontains=name).first()
        
        # Fallback if specific name not found in DB (e.g. if DB has "Vacation Leave" and key is "Vacation")
        if not lt_obj:
             # Try exact or whatever available. If not found, skip or create? 
             # Assuming standard seed data exists. If not, we can't store FK.
             continue

        # Calculate Effective Remaining
        type_used = type_usage[name]
        type_remaining = max(0, type_limit - type_used)
        
        # The core rule: "deducted equally based on 10 overall".
        # So effective balance is min(Type-Specific-Rem, Global-Rem).
        effective_remaining = min(type_remaining, global_remaining)

        # Update DB
        balance_entry, created = UserMonthlyBalance.objects.get_or_create(
            user=user,
            leave_type=lt_obj,
            year=year,
            month=month,
            defaults={'remaining_credits': effective_remaining}
        )
        
        if not created:
            balance_entry.remaining_credits = effective_remaining
            balance_entry.save()

def leave_balances(request):
    if request.method == "GET":
        usr = request.session.get("user_id")
        if not usr:
            return redirect("login")

        user = USERS.objects.filter(id=usr).first()
        if not user:
            return render(request, "login_interface.html", {"error": True})

        notif = StatusNotif.objects.filter(user=user)
        
        today = timezone.now().date()
        
        # Ensure balances are up-to-date in DB
        recalculate_monthly_balances(user, today.year, today.month)

        # Fetch from DB
        db_balances = UserMonthlyBalance.objects.filter(
            user=user,
            year=today.year,
            month=today.month
        )
        
        # Convert DB results to a dict for easy lookup: {"Vacation": 8.0, ...}
        # Matching based on containment of name in leave_type string
        db_map = {}
        for b in db_balances:
            db_map[b.leave_type.leave_type] = b.remaining_credits

        # Re-calculate global remaining for fallback (in case DB entry missing)
        GLOBAL_MONTHLY_LIMIT = 10
        leaves_this_month = LEAVE.objects.filter(
            users=user,
            status="approved",
            start_date__month=today.month,
            start_date__year=today.year
        )
        total_used = sum(l.days_count() for l in leaves_this_month)
        global_remaining = max(0, GLOBAL_MONTHLY_LIMIT - total_used)
        
        # Define Limits again to ensure order and completeness
        TYPE_LIMITS = {
            "Vacation": 10,
            "Sick": 10,
            "Maternity": 10,
            "Paternity": 10,
            "Special Privilege": 10,
            "Solo Parent": 10,
            "Study": 10,
            "VAWC": 10,
            "Special Emergency": 10
        }

        balances = []
        for name, limit in TYPE_LIMITS.items():
            # Try to find value in DB map
            # We look for keys in db_map that contain our target 'name' (e.g. "Vacation" in "Vacation Leave")
            val = None
            for db_key, db_val in db_map.items():
                if name.lower() in db_key.lower():
                    val = db_val
                    break
            
            # Fallback if not in DB
            if val is None:
                val = min(limit, global_remaining)

            # Format
            if isinstance(val, float) and val.is_integer():
                val = int(val)
                
            avail_str = f"{val} days available"
            if val == 1:
                avail_str = f"{val} day available"

            balances.append({
                "name": name,
                "available": avail_str
            })
            
        # If DB was empty (e.g. no LEAVE_TYPES found matching), fallback or empty? 
        # recalculate_monthly_balances handles creation.

        return render(request, "leave_balances.html", {
            "user": user,
            "balances": balances,
            "notif": notif
        })



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

def supervisor_dashboard(request):
    if request.method == "GET":
        
        user = USERS.objects.filter(id = request.session.get("user_id")).first()
        
        s = {}
        s["weekly"] = getWeeklyLeave(user)
        s['monthly'] = getLeaveByMonth(user=user)
        s['upcoming'] = getUpcomingLeaves(user)
        s['user'] = user
       
        s['history'] = getLeaveHistory(user)
        b = getLeaveCountByType(user)
        lb = []
        val = []
        for i in b:
            lb.append(i['type'])
            val.append(i['total'])
        s['leave_type'] = json.dumps([lb, val])
     
        s['status'] = getLeaveCountByStatus(user)
        
        dep = getLeaveMatrix(lb, user)
        s['dep'] = dep
        s['perMonth'] = getLeaveRequestsPerMonth(user=user)
        s['all_leave'] = getLeaveDaysPerMonth(user=user)
        
        # Add Cards Data
        s['total_employees'] = USERS.objects.filter(user_type='employee').count()
        
        today = now().date()
        s['on_leave_count'] = LEAVE.objects.filter(
            status='approved', 
            start_date__lte=today, 
            end_date__gte=today,
            users__department=user.department
        ).count()
        
        s['pending_requests_count'] = LEAVE.objects.filter(
            status='pending',
            users__department=user.department
        ).count()

        notif = get_status_notification(current_status="pending")
        s['notif'] = notif
        # print(allLeave)
        print(s['history'])
        return render(request, 'supervisor/dashboard.html',s )

def supervisor_requests(request):
    if request.method == "GET":
        user = USERS.objects.filter(id = request.session.get("user_id")).first()
        req = LEAVE.objects.filter(status = "pending")
        dt = list(req)
        # for i in dt:
        #     print("requests ini: ",i.leave_details.details)
        notif = get_status_notification(current_status="pending")
        return render(request, 'supervisor/requests.html', {'user':user, 'request':dt, "notif" : notif})

def supervisor_emp_profile(request, userID):
    emp = USERS.objects.filter(id=userID).first()
    print("baby ko ganda ", emp)
    if not emp:
        print("hannah not found")
        return JsonResponse({"error": "Employee not found"}, status=404)

    hr = USERS.objects.filter(id=request.session.get("user_id")).first()
    notif = get_status_notification()
    total_leave_days = (
        LEAVE.objects.filter(users=emp, status="approved")
        .aggregate(total=Sum("number_of_days_applied"))["total"] or 0
    )

    if request.method == "GET":
        print("baby ko ganda ganda hannah uwu: ", get_monthly_leave_credits(userID))
        # 🟢 Renders the normal employee profile page
        return render(
            request,
            "supervisor/emp_profile.html",
            {
                "hr": hr,
                "user": emp,
                "notif": notif,
                "leave_credits": get_monthly_leave_credits(userID),
                "leave_dates": get_user_leave_string(userID),
                "total_leave_days": total_leave_days,
            },
        )

    if request.method == "POST":
        print("baby hannah", userID)
        return JsonResponse({
            "leave_credits": get_monthly_leave_credits(userID),
            "leave_dates": get_user_leave_string(userID),
            "total_leave_days": total_leave_days,
        })

def employee_list(request):
    if request.method == "GET":
        user_id = request.session.get("user_id")
        user = USERS.objects.filter(id=user_id).first()
        if not user or user.user_type != "supervisor":
            return redirect("login")
        users = USERS.objects.filter(user_type="employee")
        notif = get_status_notification()
        return render(request, "supervisor/emp_lists.html", {"users":users, "user_count":users.count(), 'user':user, "notif": notif})

def mayor_dashboard(request):
    if request.method == "GET":
        
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
        
        s['perMonth'] = getLeaveRequestsPerMonth()
        s['all_leave'] = getLeaveDaysPerMonth()
        
        # Add Cards Data for Mayor
        s['total_employees'] = USERS.objects.filter(user_type='employee').count()
        
        today = now().date()
        s['on_leave_count'] = LEAVE.objects.filter(
            status='approved', 
            start_date__lte=today, 
            end_date__gte=today
        ).count()
        
        s['pending_requests_count'] = LEAVE.objects.filter(
            status='pending_mayor'
        ).count()

        notif = get_status_notification(current_status="pending_mayor")
        s['notif'] = notif
        # print(allLeave)
        return render(request, 'mayor/dashboard.html',s )

def mayor_requests(request):
    if request.method == "GET":
        user = USERS.objects.filter(id = request.session.get("user_id")).first()
        req = LEAVE.objects.filter(status = "pending_mayor")
        dt = list(req)
        # for i in dt:
        #     print("requests ini: ",i.leave_details.details)
        notif = get_status_notification(current_status="pending_mayor")
        return render(request, 'mayor/requests.html', {'user':user, 'request':dt, "notif" : notif})

def mayor_emp_profile(request, userID):
    emp = USERS.objects.filter(id=userID).first()
    print("baby ko ganda ", emp)
    if not emp:
        print("hannah not found")
        return JsonResponse({"error": "Employee not found"}, status=404)

    hr = USERS.objects.filter(id=request.session.get("user_id")).first()
    notif = get_status_notification()
    total_leave_days = (
        LEAVE.objects.filter(users=emp, status="approved")
        .aggregate(total=Sum("number_of_days_applied"))["total"] or 0
    )

    if request.method == "GET":
        # print("baby ko ganda ganda hannah uwu: ", get_monthly_leave_credits(userID))
        # 🟢 Renders the normal employee profile page
        return render(
            request,
            "mayor/emp_profile.html",
            {
                "hr": hr,
                "user": emp,
                "notif": notif,
                "leave_credits": get_monthly_leave_credits(userID),
                "leave_dates": get_user_leave_string(userID),
                "total_leave_days": total_leave_days,
            },
        )

    if request.method == "POST":
        print("baby hannah", userID)
        return JsonResponse({
            "leave_credits": get_monthly_leave_credits(userID),
            "leave_dates": get_user_leave_string(userID),
            "total_leave_days": total_leave_days,
        })


def mayor_list(request):
    if request.method == "GET":
        user_id = request.session.get("user_id")
        user = USERS.objects.filter(id=user_id).first()
        if not user or user.user_type != "mayor":
            return redirect("login")
        users = USERS.objects.filter(user_type="employee")
        notif = get_status_notification()
        return render(request, "mayor/emp_lists.html", {"users":users, "user_count":users.count(), 'user':user, "notif": notif})


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
            designation = request.POST.get("designation")
            salary = request.POST.get("salary")
            user = USERS(
                firstname = firstname, lastname = lastname, middlename = middlename,
                suffix = suffix, email = email, birthday = birthday,
                phone_number = phone_number, department = department,
                job_title = job_title, username = username, password = password,
                picture = picture, employee_type = employee_type, user_type = user_type,
                designation = designation, salary = salary
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
            designation = request.POST.get("designation")
            salary = request.POST.get("salary")
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
            user.designation = designation
            user.salary = salary
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
    
def getWeeklyLeave(user=None):
    today = now().date()
    start_of_week = today - timedelta(days=today.weekday())  # Monday
    end_of_week = start_of_week + timedelta(days=6)  # Sunday

    qs = LEAVE.objects.filter(
        start_date__gte=start_of_week,
        start_date__lte=end_of_week
    )
    if user and user.user_type == 'supervisor':
        qs = qs.filter(users__department=user.department)

    weekly_leaves = qs
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

def getLeaveByMonth(year=None, user=None):
    if year is None:
        year = now().year

    qs = LEAVE.objects.filter(start_date__year=year, status="approved")
    if user and user.user_type == 'supervisor':
        qs = qs.filter(users__department=user.department)

    monthly_leaves = (
        qs
        .annotate(month=ExtractMonth('start_date'))
        .values('month')
        .annotate(total=Count('id'))
        .order_by('month')
    )

    months = [0] * 12
    for m in monthly_leaves:
        months[m['month'] - 1] = m['total']

    return months

def getUpcomingLeaves(user=None):
    today = now().date()
    qs = LEAVE.objects.filter(start_date__gte=today)
    if user and user.user_type == 'supervisor':
        qs = qs.filter(users__department=user.department)
    return qs.order_by('start_date')

def getOngoingLeaves(user=None):
    today = now().date()
    qs = LEAVE.objects.filter(
        status__iexact="approved",
        start_date__lte=today,
        end_date__gte=today
    )
    if user and user.user_type == 'supervisor':
        qs = qs.filter(users__department=user.department)

    return qs.order_by('end_date').values("users__firstname", "users__middlename", "users__lastname", "users__department","leave_type__leave_type","start_date","end_date")

def apiOngoing(request):
    if request.method == "GET":
        user_id = request.session.get("user_id")
        user = USERS.objects.filter(id=user_id).first()
        o = list(getOngoingLeaves(user))
        return JsonResponse({"o": o})
def getLeaveHistory(user=None):
    today = now().date()
    qs = LEAVE.objects.filter(
        status__iexact="approved",
        end_date__lt=today
    )
    if user and user.user_type == 'supervisor':
        qs = qs.filter(users__department=user.department)
    return qs.order_by('-end_date')

def getLeaveCountByType(user=None):
    qs = LEAVE.objects.all()
    if user and user.user_type == 'supervisor':
        qs = qs.filter(users__department=user.department)
    return (
        qs
        .values(type=F("leave_type__leave_type"))
        .annotate(total=Count("id"))
        .order_by("-total")
    )

def getLeaveCountByStatus(user=None):
    qs = LEAVE.objects.all()
    if user and user.user_type == 'supervisor':
        qs = qs.filter(users__department=user.department)
        
    leave = qs.values('status').annotate(total=Count('id')).order_by('-total')
    arr = [0, 0, 0]

    for l in leave:
        if l['status'].lower() in ['pending', 'pending_hr', 'pending_mayor']: 
            arr[1] += l['total']
        elif l['status'].lower() == 'approved': 
            arr[0] += l['total']
        elif l['status'].lower() == 'rejected': 
            arr[2] += l['total']
    return arr

def getLeaveMatrix(lt, user=None):
    departments = ["HR", "IT", "Finance", "Operation"]
    matrix = []
    for leave_type in lt:
        row = [0] * len(departments)
        lv = LEAVE_TYPES.objects.filter(leave_type = leave_type).first()
        
        qs = LEAVE.objects.filter(leave_type=lv)
        if user and user.user_type == 'supervisor':
            qs = qs.filter(users__department=user.department)
            
        leave_counts = (
            qs
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

def getLeaveDaysPerMonth(year=None, user=None):
    if year is None:
        year = now().year
    months = [0] * 12  

    qs = LEAVE.objects.filter(
        start_date__year=year,
        end_date__year=year,
        status = "approved"
    )
    if user and user.user_type == 'supervisor':
        qs = qs.filter(users__department=user.department)

    for leave in qs:
        current = leave.start_date
        while current <= leave.end_date:
            if current.year == year:
                months[current.month - 1] += 1
            current += timedelta(days=1)

    return months

def getLeaveRequestsPerMonth(year=None, user=None):
    if year is None:
        year = now().year
    months = [0] * 12  
    
    qs = LEAVE.objects.filter(start_date__year=year)
    if user and user.user_type == 'supervisor':
        qs = qs.filter(users__department=user.department)
        
    monthly_counts = (
        qs
        .annotate(month=ExtractMonth('start_date'))
        .values('month')
        .annotate(total=Count('id'))
    )
    for m in monthly_counts:
        months[m['month'] - 1] = m['total']

    return months

def get_monthly_requests_data():
    today = now().date()
    labels = []
    data = []
    
    for i in range(6):
        month_idx = today.month - i
        year = today.year
        while month_idx <= 0:
            month_idx += 12
            year -= 1
        
        d = date(year, month_idx, 1)
        labels.append(d.strftime("%b"))
        
        count = LEAVE.objects.filter(
            start_date__year=year,
            start_date__month=month_idx
        ).count()
        data.append(count)
        
    return {"labels": labels, "data": data}

def getLeaveMatrixDynamic(lt):
    departments = list(USERS.objects.values_list('department', flat=True).distinct())
    departments = [d for d in departments if d]
    departments.sort()

    matrix = []
    for leave_type in lt:
        row = []
        lv_qs = LEAVE_TYPES.objects.filter(leave_type=leave_type)
        if lv_qs.exists():
            lv = lv_qs.first()
            for dept in departments:
                count = LEAVE.objects.filter(leave_type=lv, users__department=dept).count()
                row.append(count)
        else:
            row = [0] * len(departments)
        
        matrix.append(row)

    return {"departments": departments, "matrix": matrix}

def hr_dasboard(request):
    if request.method == "GET":
        if checkIfHr(request): return redirect("login")
        user = USERS.objects.filter(id = request.session.get("user_id")).first()
        
        s = {}
        s["weekly"] = getWeeklyLeave()
        
        # Dynamic Monthly Data
        monthly_data = get_monthly_requests_data()
        s['monthly'] = json.dumps(monthly_data)
        
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
        
        # Dynamic Department Data
        dep_data = getLeaveMatrixDynamic(lb)
        s['dep'] = json.dumps(dep_data)
        
        s['perMonth'] = getLeaveRequestsPerMonth()
        s['all_leave'] = getLeaveDaysPerMonth()
        notif = get_status_notification(current_status="pending_hr")
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
                month = leave.start_date.month
                year = leave.start_date.year     

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
        req = LEAVE.objects.filter(status = "pending_hr")
        dt = list(req)
        # for i in dt:
        #     print("requests ini: ",i.leave_details.details)
        notif = get_status_notification(current_status="pending_hr")
        return render(request, 'hr/requests.html', {'user':user, 'request':dt, "notif" : notif})
    
def hr_emp_reports(request):
    if request.method == "GET":
        if checkIfHr(request): return redirect("login")
        user = USERS.objects.filter(id = request.session.get("user_id")).first()
        employees = USERS.objects.filter(user_type = "employee")
        
        notif = get_status_notification()
        return render(request, 'hr/reports.html', {'user':user, "notif" : notif, "employees":employees})
    

def hr_emp_profile(request, userID):
    emp = USERS.objects.filter(id=userID).first()
    if not emp:
        print("hannah teodoro not found")
        return JsonResponse({"error": "Employee not found"}, status=404)

    hr = USERS.objects.filter(id=request.session.get("user_id")).first()
    notif = get_status_notification()
    total_leave_days = (
        LEAVE.objects.filter(users=emp, status="approved")
        .aggregate(total=Sum("number_of_days_applied"))["total"] or 0
    )

    if request.method == "GET":
        # 🟢 Renders the normal employee profile page
        return render(
            request,
            "hr/emp_profile.html",
            {
                "hr": hr,
                "user": emp,
                "notif": notif,
                "leave_credits": get_monthly_leave_credits(userID),
                "leave_dates": get_user_leave_string(userID),
                "total_leave_days": total_leave_days,
            },
        )

    if request.method == "POST":
        print(userID)
        return JsonResponse({
            "leave_credits": get_monthly_leave_credits(userID),
            "leave_dates": get_user_leave_string(userID),
            "total_leave_days": total_leave_days,
        })



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
        employee = USERS.objects.filter(id=user_id).first()
        if not employee:
            return JsonResponse({"error": "Employee not found"}, status=404)

        events = []
        
        start_date = employee.createdAt if employee.createdAt else date.today()
        today = date.today()
        
        if isinstance(start_date, datetime):
            start_date = start_date.date()
            
        current = start_date.replace(day=1)
        while current <= today:
            events.append({
                "date": current,
                "type": "ACCRUAL",
                "period": DateFormat(current).format("m/Y")
            })
            if current.month == 12:
                current = current.replace(year=current.year + 1, month=1)
            else:
                current = current.replace(month=current.month + 1)

        leaves = LEAVE.objects.filter(users=employee, status="approved")
        for leave in leaves:
            events.append({
                "date": leave.start_date,
                "type": "LEAVE",
                "obj": leave
            })

        events.sort(key=lambda x: (x['date'], 0 if x['type'] == 'ACCRUAL' else 1))

        ledger_rows = []
        vacation_balance = 10.0 
        sick_balance = 10.0     
        
        VACATION_ACCRUAL = 1.25
        SICK_ACCRUAL = 1.25

        for event in events:
            row = {
                "period": "",
                "particulars": {"type": "", "days": "", "hrs": "", "mins": ""},
                "vacation_leave": {"earned": "", "absent_with_pay": "", "balance": "", "absent_without_pay": ""},
                "sick_leave": {"earned": "", "absent_with_pay": "", "balance": "", "absent_without_pay": ""},
                "remarks": ""
            }

            if event['type'] == "ACCRUAL":
                vacation_balance += VACATION_ACCRUAL
                sick_balance += SICK_ACCRUAL
                
                row["period"] = event['period']
                row["vacation_leave"]["earned"] = VACATION_ACCRUAL
                row["vacation_leave"]["balance"] = round(vacation_balance, 3)
                row["sick_leave"]["earned"] = SICK_ACCRUAL
                row["sick_leave"]["balance"] = round(sick_balance, 3)
                row["remarks"] = "Monthly Accrual"

            elif event['type'] == "LEAVE":
                leave = event['obj']
                days = leave.days_count()
                
                is_vl = "vacation" in leave.leave_type.leave_type.lower()
                is_sl = "sick" in leave.leave_type.leave_type.lower()
                
                target = "VL" if not is_sl else "SL"
                
                row["particulars"]["type"] = leave.leave_type.leave_type
                row["particulars"]["days"] = days
                row["remarks"] = f"Inclusive Dates: {leave.start_date} to {leave.end_date}"

                if target == "VL":
                    vacation_balance -= days
                    row["vacation_leave"]["absent_with_pay"] = days
                    
                    row["vacation_leave"]["balance"] = round(vacation_balance, 3)
                    row["sick_leave"]["balance"] = round(sick_balance, 3)

                elif target == "SL":
                    sick_balance -= days
                    row["sick_leave"]["absent_with_pay"] = days
                    row["sick_leave"]["balance"] = round(sick_balance, 3)
                    row["vacation_leave"]["balance"] = round(vacation_balance, 3)

            ledger_rows.append(row)

        employee_info = {
            "full_name": f"{employee.firstname} {employee.middlename} {employee.lastname}" + (f" {employee.suffix}" if employee.suffix else ""),
            "department": employee.department,
            "created_at": employee.createdAt.strftime("%Y-%m-%d %H:%M:%S") if employee.createdAt else ""
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
        lv["salary"] = leave.users.salary
        lv["department"] = leave.users.department
        lv["picture"] = leave.users.picture.url if leave.users.picture else None
        lv["credit"] = credit

        lv["leave_type"] = leave.leave_type.leave_type
        lv["leave_details"] = leave.leave_details.details
        
        # Add HR Certification Fields
        lv["hr_certification_as_of"] = leave.hr_certification_as_of
        lv["hr_total_earned_vl"] = leave.hr_total_earned_vl
        lv["hr_total_earned_sl"] = leave.hr_total_earned_sl
        lv["hr_less_this_application_vl"] = leave.hr_less_this_application_vl
        lv["hr_less_this_application_sl"] = leave.hr_less_this_application_sl
        lv["hr_balance_vl"] = leave.hr_balance_vl
        lv["hr_balance_sl"] = leave.hr_balance_sl

        return JsonResponse({"leave": lv})


def action(request):
    if request.method == "POST":
        user_id = request.session.get("user_id")
        current_user = USERS.objects.filter(id=user_id).first()
        
        leave_id = request.POST.get("id")
        recommendationAction = request.POST.get("actionOnLeave")
        disapprovalReason1 = request.POST.get("disapprovalReason1") # Supervisor reason
        disapprovalReason2 = request.POST.get("disapprovalReason2") # Mayor reason
        date_of_action = request.POST.get("date_of_action")
        approved_days = request.POST.get("approved_disapproved_days")

        leave = LEAVE.objects.filter(id=leave_id).first()
        if not leave:
            return JsonResponse({"status": False, "msg": f"Leave not found for id {leave_id}"})
        
        # Determine who is acting
        is_hr = current_user and current_user.user_type == "hr"
        is_supervisor = current_user and current_user.user_type == "supervisor"
        is_mayor = current_user and current_user.user_type == "mayor"

        msg = "No action taken."

        # HR ACTION
        if is_hr:
            leave.recommendation_for = recommendationAction
            
            # Save HR Certification Details
            leave.hr_certification_as_of = date_of_action
            leave.hr_total_earned_vl = request.POST.get('hr_total_earned_vl')
            leave.hr_total_earned_sl = request.POST.get('hr_total_earned_sl')
            leave.hr_less_this_application_vl = request.POST.get('hr_less_this_application_vl')
            leave.hr_less_this_application_sl = request.POST.get('hr_less_this_application_sl')
            leave.hr_balance_vl = request.POST.get('hr_balance_vl')
            leave.hr_balance_sl = request.POST.get('hr_balance_sl')

            if recommendationAction == "approval":
                leave.status = "pending" # Move to Supervisor
                msg = f"Leave verified by HR. Forwarded to Supervisor."
                notif = StatusNotif(user=leave.users, leave=leave, current_status="pending")
                
                # Email Notification
                send_email_notification(
                    leave.users.email,
                    "Leave Application Verified",
                    f"Dear {leave.users.firstname},\n\nYour leave application has been verified by HR and forwarded to your Supervisor for recommendation."
                )
            else:
                leave.status = "rejected"
                msg = f"Leave rejected by HR."
                notif = StatusNotif(user=leave.users, leave=leave, current_status="rejected")
                
                # Email Notification
                send_email_notification(
                    leave.users.email,
                    "Leave Application Rejected",
                    f"Dear {leave.users.firstname},\n\nYour leave application has been rejected by HR."
                )

        # SUPERVISOR ACTION
        elif is_supervisor:
            leave.recommendation_for = recommendationAction
            leave.recommendation_for_disapproval_due_to = disapprovalReason1
            
            if recommendationAction == "approval":
                leave.status = "pending_mayor" # Move to Mayor
                msg = f"Leave recommended for approval by Supervisor. Forwarded to Mayor."
                notif = StatusNotif(user=leave.users, leave=leave, current_status="pending_mayor")
                
                # Email Notification
                send_email_notification(
                    leave.users.email,
                    "Leave Application Recommended",
                    f"Dear {leave.users.firstname},\n\nYour leave application has been recommended for approval by your Supervisor and forwarded to the Mayor."
                )
            else:
                leave.status = "rejected"
                msg = f"Leave rejected by Supervisor."
                notif = StatusNotif(user=leave.users, leave=leave, current_status="rejected")
                
                # Email Notification
                send_email_notification(
                    leave.users.email,
                    "Leave Application Rejected",
                    f"Dear {leave.users.firstname},\n\nYour leave application has been rejected by your Supervisor."
                )

        # MAYOR ACTION
        elif is_mayor:
            leave.approved_for = approved_days
            leave.disapproved_due_to = disapprovalReason2
            leave.date_of_action = date_of_action or str(timezone.now().date())

            # Check if it's an approval (no disapproval reason provided)
            # The UI logic usually implies if there's a disapproval reason, it's rejected.
            # If approved_days is filled and disapprovalReason2 is empty, it's approved.
            
            if disapprovalReason2:
                leave.status = "rejected"
                msg = f"Leave rejected by Mayor."
                notif = StatusNotif(user=leave.users, leave=leave, current_status="rejected")
                
                # Email Notification
                send_email_notification(
                    leave.users.email,
                    "Leave Application Disapproved",
                    f"Dear {leave.users.firstname},\n\nYour leave application has been disapproved by the Mayor. Reason: {disapprovalReason2}"
                )
            else:
                 # Approval
                if leave.status != "approved":
                    leave.status = "approved"
                    notif = StatusNotif(user=leave.users, leave=leave, current_status="approved")
                    
                    # Update the new monthly tracking
                    if leave.start_date:
                        recalculate_monthly_balances(leave.users, leave.start_date.year, leave.start_date.month)

                    deducted = credit("minus", leave.users, leave.days_count())
                    if deducted:
                        msg = f"Leave approved by Mayor. Deducted {leave.days_count()} days."
                    else:
                        # Even if deduction fails, we might still mark it approved but warn? 
                        # Or maybe we shouldn't approve? 
                        # For now, following existing logic:
                        msg = f"Leave approved by Mayor. Note: User had insufficient credit."
                    
                    # Email Notification
                    send_email_notification(
                        leave.users.email,
                        "Leave Application Approved",
                        f"Dear {leave.users.firstname},\n\nYour leave application has been fully approved by the Mayor."
                    )
        
        # Fallback / Admin logic (if needed, or existing logic)
        else: 
             # Keep generic logic for fallback or if user type isn't strictly checked above
             # But best to rely on roles.
             pass

        leave.save()
        if 'notif' in locals():
            notif.save()

        return JsonResponse({
            "status": True,
            "leave_id": leave.id,
            "new_status": leave.status,
            "credit": leave.users.credit,
            "msg": msg
        })
    
    return JsonResponse({"status": False, "msg": "Invalid request method"})

def approved_leave_request(request):

    if request.method == "GET":
         if checkIfHr(request): return redirect("login")
         id = request.GET.get("id")

         print(id)
         c = LEAVE.objects.filter(id = id).first()
         if not c:  return JsonResponse({"message":"data does not exist"})
         c.status = "approved"
         c.save()
         
         # Email Notification
         send_email_notification(
            c.users.email,
            "Leave Application Approved",
            f"Dear {c.users.firstname},\n\nYour leave application has been approved."
         )
         
         return JsonResponse({"status":True})
     
         
def rejected_leave_request(request):
    if request.method == "GET":
            if checkIfHr(request): return redirect("login")
            id = request.GET.get("id")
            c = LEAVE.objects.filter(id = id).first()
            if not c:  return JsonResponse({"message":"data does not exist"})
            c.status = "rejected"
            c.save()
            
            # Email Notification
            send_email_notification(
                c.users.email,
                "Leave Application Rejected",
                f"Dear {c.users.firstname},\n\nYour leave application has been rejected."
            )
            
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