from django.urls import path
from data_visualisation import views

urlpatterns = [
    path("data_visualisation",views.data_visualisation,name = "data_visualisation"),
    path("data_visualisation/visualisation", views.get_visualisation, name = "data_visualisation/visualisation"),
    path('data_visualisation/visu_gravityCenter', views.visu_gravityCenter, name='visu_gravityCenter'),
    path('data_visualisation/visu_Rifle', views.visu_rifle, name = 'visu_Rifle'),
    path('data_visualisation/addTail/', views.addTail, name = 'addTail'),
]