def test_rate_limit(client):
    for _ in range(5):
        assert client.get("/api/v1/rate-limit").status_code == 200

    response = client.get("/api/v1/rate-limit")

    assert response.status_code == 429
