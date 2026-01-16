from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import PageViewSet, BlockViewSet, CommentViewSet
from .auth_views import register, login, me, logout

router = DefaultRouter()
router.register(r'pages', PageViewSet, basename='page')
router.register(r'blocks', BlockViewSet, basename='block')
router.register(r'comments', CommentViewSet, basename='comment')

urlpatterns = [
    # Authentication
    path('auth/register/', register, name='register'),
    path('auth/login/', login, name='login'),
    path('auth/logout/', logout, name='logout'),
    path('auth/me/', me, name='me'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # API routes
    path('', include(router.urls)),
]
