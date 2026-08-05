from django.urls import path
from .views import (
    CustomTokenObtainPairView,
    RegisterView,
    UserProfileView,
    UserListView,
    UserDetailView
)

urlpatterns = [
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/me/', UserProfileView.as_view(), name='auth_me'),
    path('users/', UserListView.as_view(), name='user_list'),
    path('users/<int:pk>/', UserDetailView.as_view(), name='user_detail'),
]
