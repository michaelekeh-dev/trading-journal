import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [trades, setTrades] = useState([]);
  const [stats, setStats] = useState({ total_pnl: 0, win_rate: 0, trade_count: 0 });
  const [form, setForm] = useState({
    instrument: "",
    direction: "long",
    quantity: "",
    entry_price: "",
    exit_price: "",
    strategy: "",
    notes: "",
  });

  function refresh() {
    fetch("http://127.0.0.1:8000/trades")
      .then((res) => res.json())
      .then((data) => setTrades(data));

    fetch("http://127.0.0.1:8000/trades/stats")
      .then((res) => res.json())
      .then((data) => setStats(data));
  }

  useEffect(() => {
    refresh();
  }, []);

  function addTrade() {
    const trade = {
      ...form,
      entry_price: parseFloat(form.entry_price),
      exit_price: parseFloat(form.exit_price),
      quantity: parseFloat(form.quantity),
    };

    fetch("http://127.0.0.1:8000/trades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(trade),
    }).then(() => {
      refresh();
      setForm({ ...form, instrument: "", quantity: "", entry_price: "", exit_price: "", strategy: "", notes: "" });
    });
  }

  return (
    <div className="page">
      <header className="masthead">
        <h1 className="wordmark">Trading Journal</h1>
        <span className="eyebrow">{stats.trade_count} logged</span>
      </header>

      <section className="card summary">
        <div>
          <div className="metric-label">Net P&L</div>
          <div className={stats.total_pnl >= 0 ? "figure profit" : "figure loss"}>
            {stats.total_pnl >= 0 ? "+" : ""}{stats.total_pnl.toFixed(2)}
          </div>
        </div>
        <div>
          <div className="metric-label">Win rate</div>
          <div className="figure">{stats.win_rate.toFixed(1)}%</div>
          <div className="bar">
            <div className="bar-fill" style={{ width: `${stats.win_rate}%` }} />
          </div>
        </div>
        <div>
          <div className="metric-label">Trades</div>
          <div className="figure">{stats.trade_count}</div>
        </div>
      </section>

      <section className="card">
        <div className="metric-label">Log a trade</div>
        <div className="form-grid">
          <input
            placeholder="Instrument"
            value={form.instrument}
            onChange={(e) => setForm({ ...form, instrument: e.target.value })}
          />
          <select
            value={form.direction}
            onChange={(e) => setForm({ ...form, direction: e.target.value })}
          >
            <option value="long">Long</option>
            <option value="short">Short</option>
          </select>
          <input
            placeholder="Quantity"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
          />
          <input
            placeholder="Entry"
            value={form.entry_price}
            onChange={(e) => setForm({ ...form, entry_price: e.target.value })}
          />
          <input
            placeholder="Exit"
            value={form.exit_price}
            onChange={(e) => setForm({ ...form, exit_price: e.target.value })}
          />
          <input
            placeholder="Strategy"
            value={form.strategy}
            onChange={(e) => setForm({ ...form, strategy: e.target.value })}
          />
          <input
            className="wide"
            placeholder="Notes — why you took it, how it felt"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
          <button className="btn" onClick={addTrade}>Log trade</button>
        </div>
      </section>

      <table>
        <thead>
          <tr>
            <th>Instrument</th>
            <th>Direction</th>
            <th className="num">Qty</th>
            <th className="num">Entry</th>
            <th className="num">Exit</th>
            <th>Strategy</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {trades.length === 0 && (
            <tr>
              <td className="empty" colSpan="7">No trades logged yet. Add your first above.</td>
            </tr>
          )}
          {trades.map((t) => (
            <tr key={t.id}>
              <td>{t.instrument}</td>
              <td><span className="tag">{t.direction}</span></td>
              <td className="num">{t.quantity}</td>
              <td className="num">{t.entry_price}</td>
              <td className="num">{t.exit_price}</td>
              <td>{t.strategy}</td>
              <td>{t.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;