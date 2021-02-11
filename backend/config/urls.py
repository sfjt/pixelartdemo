from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('', include('landing.urls')),
    path('admin/', admin.site.urls),
    path('users/', include('users.urls')),
    path('editor/', include('editor.urls'))
] + static(settings.STATIC_URL)
