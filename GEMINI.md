# Project Context: LMSight (Leave Management System)



## Project Overview
LMSight is a Leave Management System built with Python and Django. It facilitates the application, approval, and tracking of employee leaves within an organization. The system is designed with multiple user roles, each having a tailored dashboard and set of permissions.

**Tech Stack:**
*   **Backend:** Python, Django 5.2
*   **Database:** SQLite (`db.sqlite3`)
*   **Frontend:** HTML templates (Django Templating Engine), CSS (Bootstrap), JavaScript.
*   **Static Files:** Served from `static/` directory.
*   **Media Files:** User uploads (profile pictures, attachments) stored in `media/`.

## LEAVE MANAGEMENT LOGIC
    0. leave balance is also called leave credit
    1. initial leave credit of user for each leave_type is 10
    2. each time user apply for leave, the leave balance will be deducted by 1 credit per day.
    3. each month, all the leave type credit will be incremented by 1.25(for vacation and sick leave only), for special priv leave it will be deducted 3.0
    
## LEAVE CHAINING APPROVAL LOGIC
    A.
        1. after the employee apply leave request, hr will receive first the request of the employee.
        2. in the hr section especifically the "DETAILS OF ACTION ON APPLICATION" modal, these are the following instructions:
            - the hr must input the total earned of all the leave type, same for  "less this application"
            - the "balance" must be automatically computed
            - remove the "7.b" and "7.c" and "7.d" section of the form
        3.when the form is submitted by the hr, the supervisor will receive now the request of the employee for approval or disapproval.
            3.1 IF THE REQUEST IS APPROVED IT WILL CONTINUE BUT IF DISAPPROVED IT WILL AUTOMATICALLY BE REJECTED AND WONT COME OUT TO THE MAYOR USER
        4. after that, the request will go to the mayor user.
        5. after the mayor submit its evaluation about the employee request

## Architecture & Directory Structure

*   `LMSight/`: Project configuration (settings, URLs, WSGI/ASGI).
*   `users/`: The main application containing logic for all user roles and leave management.
    *   `models.py`: Defines database schemas for `USERS`, `LEAVE`, `LEAVE_TYPES`, `StatusNotif`, etc.
    *   `views.py`: Contains all the business logic and view controllers.
    *   `urls.py`: URL routing for the `users` app.
*   `templates/`: HTML templates organized by role (`admin`, `hr`, `mayor`, `supervisor`) and general user pages.
*   `static/`: CSS, JavaScript, and image assets.
*   `media/`: User-uploaded content.
*   `manage.py`: Django's command-line utility.

## User Roles & Workflows

The system distinguishes between several user types, defined in the `USERS` model:
1.  **Employee:** Applies for leaves, views leave balance and history.
2.  **Supervisor:** Reviews and recommends leave applications (Step 1 of approval).
3.  **Mayor:** Final approval authority for leaves (Step 2 of approval).
4.  **HR:** Manages employee profiles, reports, and overall leave records.
5.  **Admin:** System administration, user management, and configuration of leave types.

## Key Development Commands

### 1. Setup & Installation
*   Ensure Python is installed.
*   Install dependencies (if a `requirements.txt` exists, otherwise standard Django install):
    ```bash
    pip install django
    ```

### 2. Running the Server
*   Start the development server:
    ```bash
    python manage.py runserver
    ```
*   Access the application at `http://127.0.0.1:8000/`.

### 3. Database Management
*   Make migrations (after changing `models.py`):
    ```bash
    python manage.py makemigrations
    ```
*   Apply migrations:
    ```bash
    python manage.py migrate
    ```

### 4. User Management
*   To create an admin or initial user, you may need to use the Django shell or a custom management command, as standard `createsuperuser` might not map directly if the custom `USERS` model is not hooked into Django's default Auth system fully (it uses a custom table `users_users`).

## Development Conventions

*   **Views:** The project primarily uses function-based views in `users/views.py`.
*   **Authentication:** Custom login logic is implemented in `views.login`, manually checking the `USERS` table and setting `request.session['user_id']`. It does **not** appear to use Django's built-in `User` model or authentication backend.
*   **API:** Some endpoints return `JsonResponse` for asynchronous frontend operations (e.g., in `api/` routes), while others render HTML templates.
*   **Security:** 
    *   `DEBUG` is currently set to `True` in `settings.py`.
    *   `ALLOWED_HOSTS` is set to `["*"]`.
    *   CSRF middleware is commented out in `settings.py` (Note: This is a significant security consideration for a production environment).

## Notes for Future Sessions
*   The `kulangs.txt` file appears to contain a todo list or notes (e.g., "crystal report", "email").
*   The system uses a custom `USERS` model, so standard Django auth methods (like `request.user`) are replaced by manual session lookups (`USERS.objects.filter(id=request.session.get("user_id")).first()`).
