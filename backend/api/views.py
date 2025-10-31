from django.http import JsonResponse
import random


def penalty_kick(request):
    choice = request.GET.get('choice', '').strip().lower()
    power = int(request.GET.get('power', '50'))  # Power parameter (0-100)
    too_weak = request.GET.get('tooWeak', 'false').lower() == 'true'
    too_strong = request.GET.get('tooStrong', 'false').lower() == 'true'
    
    valid_choices = ['left', 'center', 'right']
    
    if choice not in valid_choices:
        return JsonResponse({'error': '잘못된 선택입니다'}, status=400)
    
    # Determine ball height based on power
    # 0-25: too weak (always blocked)
    # 25-45: low
    # 45-55: mid  
    # 55-75: high
    # 75-100: too strong (goes over)
    
    if power < 25:
        ball_height = 'low'
    elif power < 45:
        ball_height = 'low'
    elif power < 55:
        ball_height = 'mid'
    elif power <= 75:
        ball_height = 'high'
    else:
        ball_height = 'over'
    
    # If too weak, goalkeeper ALWAYS dives to the same direction as player
    if too_weak:
        keeper_direction = choice
        keeper_height = 'low'
        keeper_choice = f"{keeper_direction}_low"
        goal = False
    elif too_strong:
        # Random keeper choice but doesn't matter since ball goes over
        keeper_direction = random.choice(['left', 'center', 'right'])
        keeper_height = random.choice(['low', 'high'])
        keeper_choice = f"{keeper_direction}_{keeper_height}"
        goal = False
    else:
        # Normal gameplay with 6 possible keeper positions
        keeper_direction = random.choice(['left', 'center', 'right'])
        keeper_height = random.choice(['low', 'high'])
        keeper_choice = f"{keeper_direction}_{keeper_height}"
        
        # Goal if:
        # 1. Different direction, OR
        # 2. Same direction but different height
        if keeper_direction != choice:
            goal = True
        elif ball_height == 'mid':
            # Mid height shots can be blocked by either high or low
            goal = False
        elif (ball_height == 'low' and keeper_height == 'high') or \
             (ball_height == 'high' and keeper_height == 'low'):
            goal = True
        else:
            goal = False
    
    return JsonResponse({
        'player_choice': choice,
        'keeper_choice': keeper_choice,
        'power': power,
        'ball_height': ball_height,
        'goal': goal,
        'message': '골인! 멋진 슛이에요!' if goal else '아! 골키퍼가 막았습니다!'
    })
