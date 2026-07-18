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

class TradeRead(TradeBase):
    id: int
    created_at: datetime
    pnl: float

def to_read(trade: Trade) -> TradeRead:
    return TradeRead(**trade.model_dump(), pnl=trade.calculate_pnl())

engine = create_engine("sqlite:///trades.db")

SQLModel.metadata.create_all(engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/trades", response_model=TradeRead)
def add_trade(trade: TradeCreate):
    with Session(engine) as session:
        db_trade = Trade.model_validate(trade)
        session.add(db_trade)
        session.commit()
        session.refresh(db_trade)
        return to_read(db_trade)


@app.get("/strategies")
def get_strategies():
    with Session(engine) as session:
        trades = session.exec(select(Trade)).all()
        return sorted({t.strategy for t in trades if t.strategy})


@app.get("/trades/stats")
def get_stats(strategy: str | None = None):
    with Session(engine) as session:
        query = select(Trade)
        if strategy is not None:
            query = query.where(Trade.strategy == strategy)
        trades = session.exec(query).all()
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
            "win_rate": (wins / len(trades)) * 100,
        }


@app.get("/trades", response_model=list[TradeRead])
def get_all_trades(strategy: str | None = None):
    with Session(engine) as session:
        query = select(Trade)
        if strategy is not None:
            query = query.where(Trade.strategy == strategy)
        trades = session.exec(query).all()
        return [to_read(t) for t in trades]


@app.get("/trades/{trade_id}", response_model=TradeRead)
def get_one_trade(trade_id: int):
    with Session(engine) as session:
        trade = session.get(Trade, trade_id)
        if trade is None:
            raise HTTPException(status_code=404, detail="Trade not found")
        return to_read(trade)


@app.put("/trades/{trade_id}", response_model=TradeRead)
def update_trade(trade_id: int, new_data: TradeCreate):
    with Session(engine) as session:
        trade = session.get(Trade, trade_id)
        if trade is None:
            raise HTTPException(status_code=404, detail="Trade not found")
        for key, value in new_data.model_dump().items():
            setattr(trade, key, value)
        session.commit()
        session.refresh(trade)
        return to_read(trade)


@app.delete("/trades/{trade_id}")
def delete_trade(trade_id: int):
    with Session(engine) as session:
        trade = session.get(Trade, trade_id)
        if trade is None:
            raise HTTPException(status_code=404, detail="Trade not found")
        session.delete(trade)
        session.commit()
        return {"deleted": trade_id}