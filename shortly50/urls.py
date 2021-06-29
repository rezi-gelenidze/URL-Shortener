from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('shortener.urls'))
]

handler404 = 'shortener.views.error404'
handler500 = 'shortener.views.error500'
handler403 = 'shortener.views.error403'
handler400 = 'shortener.views.error400'