from main import Trade, TradeCreate, Direction
from pydantic import ValidationError
import pytest

def make_trade(direction: Direction = Direction.LONG, entry_price=100.0, exit_price=110.0, quantity=10):
    return Trade(
        instrument="AAPL",
        direction=direction,
        entry_price=entry_price,
        exit_price=exit_price,
        quantity=quantity,
        notes="Test trade",
        strategy="Breakout"
    )


def test_long_trade_profit():
    assert make_trade(direction=Direction.LONG, exit_price=110.0).calculate_pnl() == 100.0

def test_long_trade_loss():
    assert make_trade(direction=Direction.LONG, exit_price=90.0).calculate_pnl() == -100.0

def test_short_trade_loss():
    assert make_trade(direction=Direction.SHORT, exit_price=110.0).calculate_pnl() == -100.0

def test_short_trade_profit():
    assert make_trade(direction=Direction.SHORT, exit_price=90.0).calculate_pnl() == 100.0

def test_breakeven():
    assert make_trade(direction=Direction.SHORT, exit_price=100.0).calculate_pnl() == 0.0

def test_uppercase_direction_rejected():
    with pytest.raises(ValidationError):
        TradeCreate(
            instrument="AAPL",
            direction="LONG",  # type: ignore[arg-type]
            entry_price=100.0,
            exit_price=110.0,
            quantity=10,
            notes="Test trade",
            strategy="Breakout"
        )