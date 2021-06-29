from django.urls import path,re_path

from . import views

urlpatterns = [
    # url redirection or index
    # if 6 char a-zA-Z0-9 is passed, redirection happens
    # else index or panel page is returned
    re_path(r'^(?P<url_id>[a-zA-Z0-9]{6})?(/)?$', views.index, name='index'),

    # APIs
    path('linkdata', views.userlinksdata, name='linkdata'),
    path('new', views.new, name='new'),
    re_path(r'^edit/(?P<url_id>[0-9]+)$', views.edit, name='edit'),
    re_path(r'^activetoggle/(?P<url_id>[0-9]+)$', views.activetoggle, name='activetoggle'),
    
    # Auth system
    path('login', views.login_view, name='login'),
    path('out', views.logout_view, name='logout'),
    path('register', views.register, name='register')
]