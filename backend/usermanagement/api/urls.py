from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views
# from .views import GoogleLogin, GoogleLoginCallback
# from . import adapter

urlpatterns = [
    #zouhair urls
    path('search-users/', views.UserSearchView.as_view(), name='user-search'),
    
    path('token/', views.Get_MyTokenObtainPairView.as_view(), name="signin"),
    path('token/refresh/', TokenRefreshView.as_view(), name="refresh-token"),
    path('register/', views.RegisterationView.as_view(), name="signup"),
    path('logout/', views.LogoutViews.as_view(), name="logout"),
    path('', views.viewallrouting, name="all-routes"),
    path('v2/auth/googlelogin/', views.GoogleLoginView, name='google_login'),
    path('v2/auth/googlelogin/callback/', views.GoogleLoginCallback.as_view(), name='gcall_back_login'),
    path('42login/callback/', views.Login42Auth.as_view(), name='42call_back_login'),
    path('password-reset/', views.send_resetpass, name='password-reset-request'),
    path('password-reset/<str:uidb64>/<str:token>/', views.Confirm_reset_Password.as_view(), name='password-reset-confirm'),
]