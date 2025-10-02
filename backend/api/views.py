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
    
    # 직접 작성
    answer = None
    
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
        op = request.GET.get('op', '+')
        user_answer = int(request.GET.get('answer', 0))
        
        if op == '+':
            correct = a + b
        elif op == '-':
            correct = a - b
        else:
            correct = a * b
        
        is_correct = user_answer == correct
        
        return JsonResponse({
            'correct': is_correct,
            'user_answer': user_answer,
            'correct_answer': correct,
            'message': 'Great job!' if is_correct else f'Not quite! The answer is {correct}'
        })
    except:
        return JsonResponse({'error': 'Invalid input'}, status=400)
