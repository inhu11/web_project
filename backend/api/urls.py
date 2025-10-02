from django.urls import path
from .views import current_time, math_quiz, check_answer


urlpatterns = [
    path('time/', current_time),
    path('math-quiz/', math_quiz),
    path('check-answer/', check_answer),
]


