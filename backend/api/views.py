from django.http import JsonResponse
from django.utils import timezone
import random


def current_time(request):
    now = timezone.now()
    return JsonResponse({
        'iso': now.isoformat(),
        'epoch': int(now.timestamp() * 1000),
        'tz': 'UTC',
    })


def math_quiz(request):
    a = random.randint(1, 20)
    b = random.randint(1, 20)
    op = random.choice(['+', '-', '*'])
    
    if op == '+':
        answer = a + b
    elif op == '-':
        answer = a - b
    elif op == '*':
        answer = a * b
    else:
        # This should never happen, but safeguard against invalid operations
        answer = 0

    return JsonResponse({
        'problem': f'{a} {op} {b}',
        'answer': answer,
        'numbers': [a, b],
        'operation': op
    })


def check_answer(request):
    try:
        a = int(request.GET.get('a', 0))
        b = int(request.GET.get('b', 0))
        op = request.GET.get('op', '+').strip()
        user_answer = int(request.GET.get('answer', 0))
        
        if op == ' ' or op == '':
            op = '+'
        
        if op == '+':
            correct = a + b
        elif op == '-':
            correct = a - b
        elif op == '*':
            correct = a * b
        else:
            return JsonResponse({'error': f'Invalid operation: {op}'}, status=400)
        
        is_correct = user_answer == correct
        
        return JsonResponse({
            'correct': is_correct,
            'user_answer': user_answer,
            'correct_answer': correct,
            'message': 'Great job!' if is_correct else f'Not quite! The answer is {correct}'
        })
    except (ValueError, TypeError):
        return JsonResponse({'error': 'Invalid input'}, status=400)


def penalty_kick(request):
    choice = request.GET.get('choice', '').strip().lower()
    
    valid_choices = ['left', 'center', 'right', '왼쪽', '중앙', '오른쪽']
    
    if choice not in valid_choices:
        return JsonResponse({'error': 'Invalid choice'}, status=400)
    
    # if choice in ['왼쪽', 'left']:
    #     choice = 'left'
    # elif choice in ['중앙', 'center']:
    #     choice = 'center'
    # elif choice in ['오른쪽', 'right']:
    #     choice = 'right'
    
    # keeper_choice = 'center'
    # goal = choice != keeper_choice
    
    return JsonResponse({
        'player_choice': choice,
        'keeper_choice': keeper_choice,
        'goal': goal,
        'message': '골인! 멋진 슛이에요!' if goal else '아! 골키퍼에게 막혔습니다!'
    })
