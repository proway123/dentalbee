from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User

from rest_framework import status
from rest_framework.test import APITestCase


class AuthenticationTest(APITestCase):
    def setUp(self):
        # Create user object
        self.test_user = User.objects.create_user(
            username="testuser", password="testpass123", email="test@example.com"
        )

        # Registration data
        self.registration_data = {
            "username": "testnewuser",
            "password": "testnewpass123",
            "password2": "testnewpass123",
        }

        # Login data
        self.login_data = {"username": "testuser", "password": "testpass123"}

    def test_user_registration_success(self):
        """Test successful user registration"""
        url = reverse("register")
        response = self.client.post(url, self.registration_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username="testnewuser").exists())

    def test_user_registration_invalid_password(self):
        """Test registration with non-matching passwords"""
        url = reverse("register")
        invalid_data = self.registration_data.copy()
        invalid_data["password2"] = "wrongpass"

        response = self.client.post(url, invalid_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

    def test_user_registration_duplicate_username(self):
        """Test registration with existing username"""
        url = reverse("register")
        duplicate_data = self.registration_data.copy()
        duplicate_data["username"] = "testuser"

        response = self.client.post(url, duplicate_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_login_success(self):
        """Test successful login and token generation"""
        url = reverse("token_login")
        response = self.client.post(url, self.login_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_user_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        url = reverse("token_login")
        invalid_data = {"username": "testuser", "password": "wrongpass"}

        response = self.client.post(url, invalid_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_token_refresh(self):
        """Test token refresh functionality"""
        # First get tokens
        login_url = reverse("token_login")
        response = self.client.post(login_url, self.login_data, format="json")
        refresh_token = response.data["refresh"]

        # Then try to refresh
        refresh_url = reverse("token_login_refresh")
        response = self.client.post(
            refresh_url, {"refresh": refresh_token}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
