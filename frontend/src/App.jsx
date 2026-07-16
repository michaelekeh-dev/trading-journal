import { useState, useEffect } from "react";

const API = "http://127.0.0.1:8000";

function App() {
  const [trades, setTrades] = useState([]);
  const [stats, setStats] = useState({ total_pnl: 0, win_rate: 0, trade_count: 0 });
  const [form, setForm] = useState({
    instrument: "",
    direction: "long",
    entry_price: "",
    exit_price: "",
    quantity: "",
    strategy: "",
    notes: "",
  });

  // load trades + stats when the page first appears
  useEffect(() => {
    refresh();
  }, []);

  function refresh() {
    fetch(`${API}/trades`)
      .then((res) => res.json())
      .then((data) => setTrades(data));
    fetch(`${API}/trades/stats`)
      .then((res) => res.json())
      .then((data) => setStats(data));
  }

  function updateField(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function addTrade() {
    const trade = {
      ...form,
      entry_price: parseFloat(form.entry_price),
      exit_price: parseFloat(form.exit_price),
      quantity: parseFloat(form.quantity),
    };
    fetch(`${API}/trades`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(trade),
    }).then(() => {
      refresh();
      setForm({ ...form, instrument: "", entry_price: "", exit_price: "", quantity: "", strategy: "", notes: "" });
    });
  }

  function deleteTrade(id) {
    fetch(`${API}/trades/${id}`, { method: "DELETE" }).then(() => refresh());
  }

  return (
    <div style={{ maxWidth: 820, margin: "40px auto", fontFamily: "system-ui, sans-serif" }}>
      <h1>Trading Journal</h1>

      <div style={{ display: "flex", gap: 32, background: "#f4f4f5", padding: 16, borderRadius: 8, margin: "16px 0" }}>
        <div>Total P&L<br /><b style={{ fontSize: 22 }}>{stats.total_pnl}</b></div>
        <div>Win rate<br /><b style={{ fontSize: 22 }}>{stats.win_rate.toFixed(1)}%</b></div>
        <div>Trades<br /><b style={{ fontSize: 22 }}>{stats.trade_count}</b></div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 24 }}>
        <input name="instrument" placeholder="Instrument" value={form.instrument} onChange={updateField} />
        <select name="direction" value={form.direction} onChange={updateField}>
          <option value="long">long</option>
          <option value="short">short</option>
        </select>
        <input name="entry_price" placeholder="Entry price" value={form.entry_price} onChange={updateField} />
        <input name="exit_price" placeholder="Exit price" value={form.exit_price} onChange={updateField} />
        <input name="quantity" placeholder="Quantity" value={form.quantity} onChange={updateField} />
        <input name="strategy" placeholder="Strategy" value={form.strategy} onChange={updateField} />
        <input name="notes" placeholder="Notes" value={form.notes} onChange={updateField} />
        <button onClick={addTrade}>Add trade</button>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left" }}>Instrument</th>
            <th style={{ textAlign: "left" }}>Dir</th>
            <th style={{ textAlign: "left" }}>Entry</th>
            <th style={{ textAlign: "left" }}>Exit</th>
            <th style={{ textAlign: "left" }}>Qty</th>
            <th style={{ textAlign: "left" }}>Strategy</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {trades.map((t) => (
            <tr key={t.id}>
              <td>{t.instrument}</td>
              <td>{t.direction}</td>
              <td>{t.entry_price}</td>
              <td>{t.exit_price}</td>
              <td>{t.quantity}</td>
              <td>{t.strategy}</td>
              <td><button onClick={() => deleteTrade(t.id)}>delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;