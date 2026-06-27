# ============================================================
# config/wsgi.py — WSGI Entry Point for Production (gunicorn)
# Run with: gunicorn config.wsgi:application
# ============================================================

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')

application = get_wsgi_application()
