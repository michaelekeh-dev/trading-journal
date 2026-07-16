from fastapi import FastAPI, Request
from sqlmodel import SQLModel, Field, Session, create_engine, select
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware

class TradeBase(SQLModel):
    instrument: str
    direction: str
    entry_price: float
    exit_price: float
    quantity: float
    notes: str
    strategy: str
    
class Trade(TradeBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.now)

    def calculate_pnl(self):
        if self.direction == "long":
            return (self.exit_price - self.entry_price) * self.quantity
            
        else:
            return (self.entry_price - self.exit_price) * self.quantity
    
class TradeCreate(TradeBase):
    pass

engine = create_engine("sqlite:///trades.db")

SQLModel.metadata.create_all(engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/trades")
def add_trade(trade: TradeCreate):
    with Session(engine) as session:
        db_trade = Trade.model_validate(trade)
        session.add(db_trade)
        session.commit()
        session.refresh(db_trade)
        return db_trade

@app.get("/trades/stats")
def get_stats(strategy: str | None = None):
    with Session(engine) as session:
        if strategy is None:
            trades = session.exec(select(Trade)).all()
        else:
            trades = session.exec(select(Trade).where(Trade.strategy == strategy)).all()
        if not trades:
            return {"total_pnl": 0, "win_rate": 0, "trade_count": 0}
        total_pnl = 0
        wins = 0
        for trade in trades:
            pnl = trade.calculate_pnl()
            total_pnl = total_pnl + pnl
            if pnl > 0:
                wins = wins + 1
        return {
            "total_pnl": total_pnl,
            "trade_count": len(trades),
            "win_rate": (wins / len(trades)) * 100
        }
    
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
        return {"trade": trade, "pnl": trade.calculate_pnl()}
    
@app.get("/trades")
def get_all_trades(strategy: str | None = None):
    with Session(engine) as session:
        if strategy is None:
            trades = session.exec(select(Trade)).all()
        else:
            trades = session.exec(select(Trade).where(Trade.strategy == strategy)).all()
        return trades

@app.put("/trades/{trade_id}")
def update_trade(trade_id: int, new_data: Trade):
    with Session(engine) as session:
        trade = session.get(Trade, trade_id)
        if trade is None:
            return {"error": "Couldnt Find Trade ID"}
        trade.instrument = new_data.instrument
        trade.direction = new_data.direction
        trade.entry_price = new_data.entry_price
        trade.exit_price = new_data.exit_price
        trade.quantity = new_data.quantity
        trade.notes = new_data.notes
        trade.strategy = new_data.strategy
        session.commit()
        session.refresh(trade)
        return "Updated Trade!"
    
