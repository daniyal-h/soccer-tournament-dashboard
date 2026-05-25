from unittest.mock import Mock


def test_rate_limit(client, app):
    app.state.limiter.reset()

    for _ in range(5):
        assert client.get("/api/v1/rate-limit").status_code == 200

    response = client.get("/api/v1/rate-limit")

    assert response.status_code == 429


def test_get_client_ip_uses_first_forwarded_ip():
    from app.middleware.rate_limit import get_client_ip

    request = Mock()
    request.headers = {"X-Forwarded-For": "203.0.113.1, 10.0.0.1"}
    request.client.host = "127.0.0.1"

    assert get_client_ip(request) == "203.0.113.1"


def test_get_client_ip_falls_back_to_request_client():
    from app.middleware.rate_limit import get_client_ip

    request = Mock()
    request.headers = {}
    request.client.host = "127.0.0.1"

    assert get_client_ip(request) == "127.0.0.1"
