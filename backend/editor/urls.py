from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    NewEditorView,
    EditorView,
    EditorListView,
    EditorDataViewSet
)

app_name = 'editor'

router = DefaultRouter()
router.register('data', EditorDataViewSet, 'data')

urlpatterns = [
    path('new/', NewEditorView.as_view(), name='new'),
    path('edit/<uuid:pk>/', EditorView.as_view(), name='edit'),
    path('list/', EditorListView.as_view(), name='list')
] + router.urls
