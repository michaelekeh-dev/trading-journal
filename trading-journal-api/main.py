from fastapi import FastAPI, Request

app = FastAPI()

trades = []


@app.post("/trades")
def add_trade(trade: dict):
    trade["id"] = len(trades) + 1
    trades.append(trade)
    return trade

@app.delete("/trades/{trade_id}")
def delete_trade(trade_id: int):
    for trade in trades:
        if trade["id"] == trade_id:
            trades.remove(trade)
            return {"deleted": trade_id}
    return {"error": "trade not found"}

@app.get("/trades/{trade_id}")
def get_one_trade(trade_id: int):
    for trade in trades:
        if trade["id"] == trade_id:
            return trade
    return {"error": "Couldnt Find Trade ID"}