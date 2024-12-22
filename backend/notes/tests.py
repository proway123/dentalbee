import os

from django.test import TestCase
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status

from .models import Note
from .serializers import NoteSerializer


class NoteAPITests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser", password="testpass123"
        )
        self.other_user = User.objects.create_user(
            username="otheruser", password="testpass123"
        )
        self.note = Note.objects.create(
            title="Test Note", description="Test Description", user=self.user
        )
        self.audio_file = SimpleUploadedFile(
            "test_audio.webm", content=b"Test Audio", content_type="audio/webm"
        )

        self.client.force_authenticate(user=self.user)
        # Updated URL patterns to match Django REST framework's default routing
        self.notes_url = "/api/notes/"
        self.note_url = f"/api/notes/{self.note.id}/"

    def test_create_note(self):
        """Test creating a new note"""
        data = {"title": "New Note", "description": "New Description"}
        response = self.client.post(self.notes_url, data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["title"], "New Note")
        self.assertEqual(response.data["user"], self.user.id)

    def test_retrieve_note(self):
        """Test retrieving a specific note"""
        response = self.client.get(self.note_url)
        serializer = NoteSerializer(self.note)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, serializer.data)

    def test_update_note(self):
        """Test updating a note"""
        data = {"title": "Updated Note", "description": "Updated Description"}
        response = self.client.put(self.note_url, data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.note.refresh_from_db()
        self.assertEqual(self.note.title, "Updated Note")
        self.assertEqual(self.note.description, "Updated Description")

    def test_delete_note(self):
        """Test deleting a note"""
        response = self.client.delete(self.note_url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Note.objects.count(), 0)

    def test_create_note_with_audio(self):
        """Test creating a note with an audio file"""
        data = {
            "title": "Test Note",
            "description": "Test Description",
            "audio": self.audio_file,
        }
        response = self.client.post(self.notes_url, data, format="multipart")
        note = Note.objects.get(id=response.data["id"])

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("audio", response.data)
        self.assertTrue(note.audio)
        self.assertTrue(os.path.exists(note.audio.path))
