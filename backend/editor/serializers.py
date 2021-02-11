from rest_framework import serializers
from django.http import Http404
from .models import Editor


class EditorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Editor
        fields = ('id', 'editor_state', 'title')

    def create(self, validated_data):
        user = None
        req = self.context.get('request')
        if req and hasattr(req, 'user'):
            user = req.user

        if user and user.is_authenticated:
            canvas = Editor(
                editor_state=validated_data['editor_state'],
                owner=user,
                title=validated_data['title']
            )
            canvas.save()
            return canvas

        raise Http404
