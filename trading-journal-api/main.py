from fastapi import FastAPI, Request
from sqlmodel import SQLModel, Field, Session, create_engine, select


class Trade(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    instrument: str
    direction: str
    entry_price: float
    exit_price: float   

engine = create_engine("sqlite:///trades.db")

SQLModel.metadata.create_all(engine)

app = FastAPI()

@app.post("/trades")
def add_trade(trade: Trade):
    with Session(engine) as session:
        session.add(trade)
        session.commit()
        session.refresh(trade)
        return trade

@app.delete("/trades/{trade_id}")
def delete_trade(trade_id: int):
    with Session(engine) as session:
        trade = session.get(Trade, trade_id)
        if trade is None:
            return {"error": "trade not found"}
        session.delete(trade)
        session.commit()
        return {"deleted": trade_id}

@app.get("/trades/{trade_id}")
def get_one_trade(trade_id: int):
    with Session(engine) as session:
        trade = session.get(Trade, trade_id)
        if trade is None:
            return {"error": "Couldnt Find Trade ID"}
        return trade
    
@app.get("/trades")
def get_all_trades():
    with Session(engine) as session:
        trades = session.exec(select(Trade)).all()
        return trades   