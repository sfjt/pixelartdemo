from django.urls import path
from .views import (
    SignUpView,
    SignUpVerificationView,
    LoginView,
    LogoutView,
    ProfileView,
    ProfileChangeView,
    PasswordChangeView,
    PasswordResetView,
    PasswordResetConfirmView,
    EmailChangeView,
    EmailChangeConfirmView
)

app_name = 'users'

urlpatterns = [
    path('signup/', SignUpView.as_view(), name='signup'),
    path('signup/verification/<token>', SignUpVerificationView.as_view(),
         name='signup_verification'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('profile/', ProfileView.as_view(), name='profile_view'),
    path('profile/edit/', ProfileChangeView.as_view(), name="profile_change"),
    path('password/change/', PasswordChangeView.as_view(), name='password_change'),
    path('password/reset/', PasswordResetView.as_view(), name='password_reset'),
    path('password/reset/verification/<uidb64>/<token>', PasswordResetConfirmView.as_view(),
         name='password_reset_confirm'),
    path('email/change/', EmailChangeView.as_view(), name='email_change'),
    path('email/change/verification/<token>', EmailChangeConfirmView.as_view(),
         name='email_change_verification'),
]
