# ============================================================
# tests/test_views.py — Django API Tests (pytest-django)
# Run with: pytest
# ============================================================

import pytest
from django.urls import reverse

@pytest.mark.django_db
def test_home_returns_200(client):
    response = client.get('/')
    assert response.status_code == 200

@pytest.mark.django_db
def test_home_returns_message(client):
    response = client.get('/')
    data = response.json()
    assert 'message' in data
    assert 'version' in data
    assert 'environment' in data

@pytest.mark.django_db
def test_health_returns_ok(client):
    response = client.get('/health/')
    assert response.status_code == 200
    assert response.json()['status'] == 'ok'
