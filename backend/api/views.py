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
        
        # Handle URL encoding issue: + in URL becomes space
        if op == ' ' or op == '':
            op = '+'
        
        # Validate operation
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
