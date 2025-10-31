from django.urls import path
from .views import penalty_kick


urlpatterns = [
    path('penalty-kick/', penalty_kick),
]
