from django.views.generic import (
    TemplateView,
    DetailView,
    ListView,
)
from django.contrib.auth.mixins import LoginRequiredMixin
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from .models import Editor
from .serializers import EditorSerializer
from .permissions import IsOwner
from .mixins import OwnerOnlyMixin


class NewEditorView(LoginRequiredMixin, TemplateView):
    template_name = 'editor/editor_new.html'


class EditorView(LoginRequiredMixin, OwnerOnlyMixin, DetailView):
    template_name = 'editor/editor_edit.html'
    model = Editor


class EditorListView(LoginRequiredMixin, ListView):
    template_name = 'editor/editor_list.html'
    model = Editor

    def get_queryset(self):
        user = self.request.user
        return Editor.objects.filter(owner=user).order_by('created_datetime')


class EditorDataViewSet(ModelViewSet):
    serializer_class = EditorSerializer

    def get_queryset(self):
        user = self.request.user
        return Editor.objects.filter(owner=user)

    def get_permissions(self):
        if self.action in ('retrieve', 'update', 'destroy', 'partial_update'):
            permission_classes = [IsOwner]
        else:
            # 'create'
            permission_classes = [IsAuthenticated]

        return [permission() for permission in permission_classes]
