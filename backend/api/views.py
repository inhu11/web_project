from django.http import JsonResponse
import random


def penalty_kick(request):
    choice = request.GET.get('choice', '').strip().lower()
    power = int(request.GET.get('power', '50'))
    too_weak = request.GET.get('tooWeak', 'false').lower() == 'true'
    too_strong = request.GET.get('tooStrong', 'false').lower() == 'true'
    
    # Determine ball trajectory from power

    
    # Generate random goalkeeper position

    
    # Determine if goal

    
    return JsonResponse({
        'player_choice': choice,
        'keeper_choice': keeper_choice,
        'power': power,
        'ball_trajectory': ball_trajectory,
        'goal': goal,
        'message': '골인! 멋진 슛이에요!' if goal else '아! 골키퍼가 막았습니다!'
    })
