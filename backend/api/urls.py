from django.urls import path
from .views import current_time, math_quiz, check_answer, penalty_kick


urlpatterns = [
    path('time/', current_time),
    path('math-quiz/', math_quiz),
    path('check-answer/', check_answer),
    path('penalty-kick/', penalty_kick),
]


