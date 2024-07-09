from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.utils.encoding import force_bytes, force_text
from django.template.loader import render_to_string
from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.auth.models import User
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.shortcuts import render, redirect
from django.core.mail import send_mail, EmailMessage
from django.contrib.sites.shortcuts import get_current_site
from authentification import settings
from .token import generatorToken




# Create your views here.

def home(request):
    """
    Display the home page of the application.

    This function handles the received HTTP request and returns the HTML page
    located at "app/index.html" as a response.

    Parameters:
    request (HttpRequest): The HTTP request received by the server.

    Returns:
    HttpResponse: The HTTP response with the content of the home page.
    """

    return render(request, "app/index.html")

def register(request):
    """
    Handle user registration.

    This function processes the registration form submitted via a POST request.
    It validates the user inputs, checks for existing users with the same username
    or email, and ensures the password fields match. If any validation fails,
    it sets an error message and redirects back to the registration page.

    Parameters:
    request (HttpRequest): The HTTP request received by the server.

    Returns:
    HttpResponse: The HTTP response, either redirecting back to the registration page
                  with an error message or (if the function is extended) a successful 
                  registration handling.
    """

    if request.method == "POST" : 
        username = request.POST['username']
        firstname = request.POST['firstname']
        lastname = request.POST['lastname']
        email = request.POST['email']
        password = request.POST['password']
        password1 = request.POST['password1']

        if User.objects.filter(username=username):
            messages.error(request,'This username already exists')
            return redirect('register')
        if User.objects.filter(email=email):
            messages.error(request,'This email address is already in use by another account')
            return redirect('register')
        if not username.isalnum():
            messages.error(request, 'The entered name is not correct')
            return redirect('register')
        if password != password1:
            messages.error(request, 'The two passwords do not match')
            return redirect('register')


        my_user = User.objects.create_user(username, email, password)
        my_user.first_name = firstname
        my_user.last_name = lastname
        my_user.is_active = False
        my_user.save()

        messages.success(request, 'Your account has been successfully created')
        subject = "Welcome!"
        message = "Welcome " + my_user.first_name + " " + my_user.last_name + "\nWe are happy to have you with us\n\n\n Thank you! \n\n"
        from_email = settings.EMAIL_HOST_USER
        to_list = [my_user.email]
        send_mail(subject,message,from_email,to_list,fail_silently=False)

        current_site = get_current_site(request)
        subject = "Confirmation of your email address"
        message = render_to_string("emailconfirm.html",{
            "name" : my_user.first_name,
            "domain" : current_site.domain,
            "uid" : urlsafe_base64_encode(force_bytes(my_user.pk)),
            "token" : generatorToken.make_token(my_user)
        })
        email = EmailMessage(email,message,settings.EMAIL_HOST_USER,[my_user.email])
        email.fail_silently = False
        email.send()
        return redirect('login')

    return render(request, "app/register.html")

def lOgin(request):
    """
    Handle user login.

    This function processes the login form submitted via a POST request.
    It authenticates the user by checking the provided username and password.
    If authentication is successful, the user is logged in and redirected to 
    the home page with a personalized greeting. If authentication fails, an 
    error message is displayed and the user is redirected back to the login page.

    Parameters:
    request (HttpRequest): The HTTP request received by the server.

    Returns:
    HttpResponse: The HTTP response, either rendering the home page upon 
                  successful login or redirecting back to the login page 
                  with an error message.
    """

    if request.method == "POST":
        username = request.POST.get('username')
        password = request.POST.get('password')
        if User.objects.filter(username=username).exists():
            user = authenticate(username=username, password=password)
            
            if user is not None:
                login(request, user)
                firstname = user.first_name
                return render(request, "app/index.html", {'firstname': firstname})
            else:
                messages.error(request, 'Invalid authentication, please try again later')
        else:
            messages.error(request, 'User does not exist')
                
        return redirect('login')

    return render(request, "app/login.html")

def logOut(request):
    """
    Handle user logout.

    This function logs out the currently authenticated user, adds a success 
    message to inform the user of successful logout, and redirects to the 
    home page.

    Parameters:
    request (HttpRequest): The HTTP request received by the server.

    Returns:
    HttpResponse: The HTTP response redirecting to the home page.
    """

    logout(request)
    messages.success(request, "You have been successfully logged out")
    return redirect('home')

def activate(request,uidb64,token):
    """
    Handle user account activation.

    This function activates a user's account by decoding the provided user ID
    and verifying the activation token. If the user exists and the token is valid,
    the user's account is activated, and a success message is displayed. Otherwise,
    an error message is shown.

    Parameters:
    request (HttpRequest): The HTTP request received by the server.
    uidb64 (str): The base64 encoded user ID.
    token (str): The activation token.

    Returns:
    HttpResponse: The HTTP response redirecting to the login page upon successful 
                  activation or to the home page if activation fails.
    """
     
    try:
        uid = force_text(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except(TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None
    
    if user is not None and generatorToken.check_token(user,token):
        user.is_active = True
        user.save()
        messages.success(request,"Your account has been activated")
        return redirect('login')
    else : 
        messages.error(request, "The activation of your account has failed")
        return redirect('home')