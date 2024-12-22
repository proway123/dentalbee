from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from authentication.views import RegisterView


urlpatterns = [
    path("token-login/", TokenObtainPairView.as_view(), name="token_login"),
    path(
        "token-login/refresh/", TokenRefreshView.as_view(), name="token_login_refresh"
    ),
    path("register/", RegisterView.as_view(), name="register"),
]
