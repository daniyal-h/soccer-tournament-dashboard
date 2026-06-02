from app.api.v1.clients import football_api
from app.constants.external_apis import API_FOOTBALL_BASE_URL


def test_football_get_calls_requests_with_expected_arguments(mocker):
    response = mocker.Mock()
    response.json.return_value = {"response": [{"id": 1}]}

    requests_get = mocker.patch.object(
        football_api.requests,
        "get",
        return_value=response,
    )
    mocker.patch.object(
        football_api.settings,
        "API_FOOTBALL_API_KEY",
        "test-api-key",
    )

    result = football_api.football_get(
        "/fixtures",
        {
            "league": 9,
            "season": "2024",
        },
    )

    requests_get.assert_called_once_with(
        f"{API_FOOTBALL_BASE_URL}/fixtures",
        headers={
            "x-apisports-key": "test-api-key",
        },
        params={
            "league": 9,
            "season": "2024",
        },
        timeout=10,
    )
    response.raise_for_status.assert_called_once_with()
    response.json.assert_called_once_with()

    assert result == {"response": [{"id": 1}]}


def test_football_get_raises_http_error_before_returning_json(mocker):
    response = mocker.Mock()
    response.raise_for_status.side_effect = RuntimeError("API failed")

    mocker.patch.object(
        football_api.requests,
        "get",
        return_value=response,
    )

    try:
        football_api.football_get("/standings", {"league": 9})
    except RuntimeError as exc:
        assert str(exc) == "API failed"
    else:
        raise AssertionError("Expected football_get to raise")

    response.raise_for_status.assert_called_once_with()
    response.json.assert_not_called()
