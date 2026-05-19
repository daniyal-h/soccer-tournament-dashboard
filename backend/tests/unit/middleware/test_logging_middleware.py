def test_request_logging_middleware_adds_request_id(client):
    response = client.get("/")

    assert response.status_code == 200
    assert "X-Request-ID" in response.headers


# skip health endpoint logging
def test_health_endpoint_is_not_logged(client, mocker):
    logger_info = mocker.patch("app.middleware.logging.logger.info")

    response = client.get("/api/v1/health")

    assert response.status_code == 200
    logger_info.assert_not_called()


def test_request_logging_logs_request(client, mocker):
    logger_info = mocker.patch("app.middleware.logging.logger.info")

    response = client.get("/")

    assert response.status_code == 200

    logger_info.assert_called_once()

    _, kwargs = logger_info.call_args

    assert kwargs["method"] == "GET"
    assert kwargs["path"] == "/"
    assert kwargs["status_code"] == 200
    assert "request_id" in kwargs
