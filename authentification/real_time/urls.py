from django.urls import path
from real_time import views

urlpatterns = [
    path("wbb",views.wbb,name = "wbb"),
    path("connectSensors",views.connectSensors,name="connectSensors"),
    path("connectWiiboard",views.connectWiiboard,name="connectWiiboard"),
    path('stop_measure/', views.stop_measure_view, name='stop_measure'),
    path('start_measure/', views.start_measure_view, name='start_measure')
]