from django.urls import path
from .views import LandingView
from users.views import (
    LoginView,
    SignUpView
)

app_name = 'landing'

urlpatterns = [
    path('', LandingView.as_view(), name='default'),
    path('login/', LoginView.as_view(), name='login'),
    path('signup/', SignUpView.as_view(), name='signup'),
]
