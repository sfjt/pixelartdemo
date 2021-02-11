import uuid
from django.conf import settings
from django.urls import reverse_lazy
from django.views.generic import (
    CreateView,
    FormView,
    UpdateView,
    TemplateView,
)
from django.contrib.auth.views import (
    LoginView,
    LogoutView,
    PasswordChangeView,
    PasswordResetView,
    PasswordResetConfirmView,
)
from django.contrib.auth.forms import PasswordResetForm
from django.shortcuts import render
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth import get_user_model
from django.contrib.sites.shortcuts import get_current_site
from django.core.signing import (
    BadSignature,
    SignatureExpired,
    loads,
    dumps,
)
from django.template.loader import render_to_string
from django.http import HttpResponseBadRequest
from django.core.mail import send_mail
from .forms import (
    UserCreationForm,
    AuthenticationForm,
    ProfileChangeForm,
    PasswordChangeForm,
    EmailChangeForm,
    SetPasswordForm,
)

User = get_user_model()


class SignUpView(CreateView):
    """
    Sends a confirmation request email to the user before committing.
    """
    form_class = UserCreationForm
    template_name = 'users/signup.html'

    def form_valid(self, form):
        user = form.save(commit=False)
        user.is_active = False
        user.save()

        subject = render_to_string('users/signup_subject.txt', {})
        site = get_current_site(self.request)
        domain = site.domain
        mail_body_ctx = {
            'protocol': self.request.scheme,
            'domain': domain,
            'token': dumps(user.pk.hex),
            'user': user,
        }
        message = render_to_string('users/signup_body.txt', mail_body_ctx)
        user.security_email(subject, message)

        return render(self.request, 'users/security_email_sent.html')


class SignUpVerificationView(TemplateView):
    template_name = 'users/welcome.html'
    timeout_seconds = 60 * 60 * 6

    def get(self, request, **kwargs):
        token = kwargs.get('token')
        try:
            pk_hex = loads(token, max_age=self.timeout_seconds)
        except SignatureExpired:
            return HttpResponseBadRequest()
        except BadSignature:
            return HttpResponseBadRequest()

        else:
            try:
                user = User.objects.get(pk=uuid.UUID(pk_hex))
            except User.DoesNotExist:
                return HttpResponseBadRequest()
            else:
                if not user.is_active:
                    user.is_active = True
                    user.save()
                    return super().get(request, **kwargs)

        return HttpResponseBadRequest()


class LoginView(LoginView):
    form_class = AuthenticationForm
    template_name = 'users/login.html'


class LogoutView(LogoutView):
    template_name = 'users/logout.html'


class ProfileView(LoginRequiredMixin, TemplateView):
    model = User
    template_name = 'users/profile_view.html'


class ProfileChangeView(LoginRequiredMixin, UpdateView):
    template_name = 'users/profile_change.html'
    form_class = ProfileChangeForm
    success_url = reverse_lazy('users:profile_view')

    def get_object(self, queryset=None):
        return self.request.user


class PasswordChangeView(PasswordChangeView):
    template_name = 'users/password_change.html'
    form_class = PasswordChangeForm
    success_url = reverse_lazy("users:logout")


class PasswordResetView(PasswordResetView):
    subject_template_name = 'users/password_reset_subject.txt'
    email_template_name = 'users/password_reset_body.txt'
    template_name = 'users/password_reset.html'
    form_class = PasswordResetForm

    def form_valid(self, form):
        opts = {
            'use_https': self.request.is_secure(),
            'token_generator': self.token_generator,
            'from_email': self.from_email,
            'email_template_name': self.email_template_name,
            'subject_template_name': self.subject_template_name,
            'request': self.request,
            'html_email_template_name': self.html_email_template_name,
            'extra_email_context': self.extra_email_context,
        }
        form.save(**opts)
        return render(self.request, 'users/security_email_sent.html')


class PasswordResetConfirmView(PasswordResetConfirmView):
    template_name = 'users/password_reset_confirm.html'
    form_class = SetPasswordForm
    success_url = reverse_lazy("users:logout")


class EmailChangeView(LoginRequiredMixin, FormView):
    template_name = 'users/email_change.html'
    form_class = EmailChangeForm

    def form_valid(self, form):
        user = self.request.user
        new_email = form.cleaned_data['email']

        subject = render_to_string('users/email_change_subject.txt', {})
        site = get_current_site(self.request)
        domain = site.domain
        mail_body_ctx = {
            'protocol': self.request.scheme,
            'domain': domain,
            'token': dumps(new_email),
            'user': user,
        }
        message = render_to_string('users/email_change_body.txt', mail_body_ctx)
        send_mail(subject, message, None, [new_email])

        return render(self.request, 'users/security_email_sent.html')


class EmailChangeConfirmView(TemplateView):
    template_name = 'users/email_change_verification.html'
    timeout_seconds = getattr(settings, 'ACTIVATION_TIMEOUT_SECONDS', 60*60*24)

    def get(self, request, **kwargs):
        token = kwargs.get('token')
        try:
            new_email = loads(token, max_age=self.timeout_seconds)
        except SignatureExpired:
            return HttpResponseBadRequest()
        except BadSignature:
            return HttpResponseBadRequest()

        else:
            User.objects.filter(email=new_email, is_active=False).delete()
            user = request.user
            user.email = new_email
            user.save()
            return super().get(request, **kwargs)
