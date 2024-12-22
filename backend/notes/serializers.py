from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Note


class NoteSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Note
        fields = [
            "id",
            "title",
            "description",
            "audio",
            "created_at",
            "updated_at",
            "user",
        ]
