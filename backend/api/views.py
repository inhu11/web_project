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
            return JsonResponse({'error': f'잘못된 연산: {op}'}, status=400)
        
        is_correct = user_answer == correct
        
        return JsonResponse({
            'correct': is_correct,
            'user_answer': user_answer,
            'correct_answer': correct,
            'message': '정답입니다!' if is_correct else f'아쉽네요! 정답은 {correct}입니다'
        })
    except (ValueError, TypeError):
        return JsonResponse({'error': '잘못된 입력입니다'}, status=400)


def penalty_kick(request):
    choice = request.GET.get('choice', '').strip().lower()
    
    valid_choices = ['left', 'center', 'right']
    
    if choice not in valid_choices:
        return JsonResponse({'error': '잘못된 선택입니다'}, status=400)
    
    # Random goalkeeper choice
    keeper_choice = random.choice(['left', 'center', 'right'])
    goal = choice != keeper_choice
    
    return JsonResponse({
        'player_choice': choice,
        'keeper_choice': keeper_choice,
        'goal': goal,
        'message': '골인! 멋진 슛이에요!' if goal else '아! 골키퍼가 막았습니다!'
    })
