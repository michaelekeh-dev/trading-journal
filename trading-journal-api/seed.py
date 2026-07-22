from sqlmodel import Session
from main import engine, Trade, Direction

trades = [
    Trade(instrument="AAPL", direction=Direction.LONG, entry_price=182.50,
          exit_price=189.20, quantity=25, strategy="Breakout",
          notes="Broke out of a two week range on volume. Held to the target."),

    Trade(instrument="NVDA", direction=Direction.LONG, entry_price=118.40,
          exit_price=112.85, quantity=40, strategy="Pullback",
          notes="Bought the dip too early. No sign of a reversal, I just wanted in."),

    Trade(instrument="TSLA", direction=Direction.SHORT, entry_price=264.00,
          exit_price=249.30, quantity=15, strategy="Mean Reversion",
          notes="Stretched way above the 20 day. Faded it and it came back fast."),

    Trade(instrument="MSFT", direction=Direction.LONG, entry_price=412.75,
          exit_price=425.60, quantity=10, strategy="Trend Continuation",
          notes="Clean higher low into the trend. Boring setup, worked fine."),

    Trade(instrument="AMD", direction=Direction.SHORT, entry_price=142.10,
          exit_price=147.55, quantity=30, strategy="Breakout",
          notes="Shorted the breakdown and it reclaimed the level immediately. Cut it."),

    Trade(instrument="SPY", direction=Direction.LONG, entry_price=578.20,
          exit_price=584.90, quantity=20, strategy="Pullback",
          notes="Waited for the retest this time instead of chasing. Made the difference."),

    Trade(instrument="META", direction=Direction.LONG, entry_price=596.00,
          exit_price=581.40, quantity=8, strategy="News Catalyst",
          notes="Bought into earnings. Gambling, not trading. Stop doing this."),
]

with Session(engine) as session:
    for trade in trades:
        session.add(trade)
    session.commit()

print(f"Added {len(trades)} trades")