from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_missing_trade_returns_404():
    assert client.get("/trades/999999").status_code == 404

def test_delete_missing_trade_returns_404():
    assert client.delete("/trades/999999").status_code == 404

def test_uppercase_direction_returns_422():
    response = client.post("/trades", json={
        "instrument": "AAPL", "direction": "LONG",
        "entry_price": 100.0, "exit_price": 110.0,
        "quantity": 10, "notes": "test", "strategy": "Breakout"
    })
    assert response.status_code == 422