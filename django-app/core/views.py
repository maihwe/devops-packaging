# ============================================================
# core/views.py — API Views
# ============================================================

from rest_framework.decorators import api_view
from rest_framework.response import Response
import django
import sys

@api_view(['GET'])
def home(request):
    return Response({
        'message': 'DevOps Django App is running!',
        'environment': 'development',
        'version': '1.0.0',
        'django_version': django.get_version(),
    })

@api_view(['GET'])
def health(request):
    return Response({
        'status': 'ok',
        'python_version': sys.version,
    })
