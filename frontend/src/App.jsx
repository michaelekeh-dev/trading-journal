import { useState, useEffect } from "react";
import "./App.css";

const API = import.meta.env.VITE_API_URL;

const BLANK = {
  instrument: "",
  direction: "long",
  quantity: "",
  entry_price: "",
  exit_price: "",
  strategy: "",
  notes: "",
};


function App() {
  const [trades, setTrades] = useState([]);
  const [stats, setStats] = useState({ total_pnl: 0, win_rate: 0, trade_count: 0 });
  const [strategies, setStrategies] = useState([]);
  const [filter, setFilter] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [loading, setLoading] = useState(true);

  function refresh() {
    setLoading(true);
    const q = filter ? `?strategy=${encodeURIComponent(filter)}` : "";
    Promise.all([
      fetch(`${API}/trades${q}`).then((r) => r.json()).then(setTrades),
      fetch(`${API}/trades/stats${q}`).then((r) => r.json()).then(setStats),
      fetch(`${API}/strategies`).then((r) => r.json()).then(setStrategies),
    ]).finally(() => setLoading(false));
  }
  useEffect(() => {
    refresh();
  }, [filter]);

  function saveTrade() {
    const editing = editingId !== null;
    const body = {
      ...form,
      quantity: parseFloat(form.quantity),
      entry_price: parseFloat(form.entry_price),
      exit_price: parseFloat(form.exit_price),
    };

    fetch(editing ? `${API}/trades/${editingId}` : `${API}/trades`, {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(() => {
      cancelEdit();
      refresh();
    });
  }

  function startEdit(t) {
    setEditingId(t.id);
    setForm({
      instrument: t.instrument,
      direction: t.direction,
      quantity: t.quantity,
      entry_price: t.entry_price,
      exit_price: t.exit_price,
      strategy: t.strategy,
      notes: t.notes,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(BLANK);
  }

  function deleteTrade(id) {
    fetch(`${API}/trades/${id}`, { method: "DELETE" }).then(() => refresh());
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
        <div className="metric-label">{editingId ? "Edit trade" : "Log a trade"}</div>
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
          <button className="btn" onClick={saveTrade}>
            {editingId ? "Save changes" : "Log trade"}
          </button>
          {editingId && (
            <button className="btn btn-ghost" onClick={cancelEdit}>Cancel</button>
          )}
        </div>
      </section>

      <div className="toolbar">
        <span className="metric-label">Filter by strategy</span>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All strategies</option>
          {strategies.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <table>
        <thead>
          <tr>
            <th>Instrument</th>
            <th>Direction</th>
            <th className="num">Qty</th>
            <th className="num">Entry</th>
            <th className="num">Exit</th>
            <th className="num">P&L</th>
            <th>Strategy</th>
            <th>Notes</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td className="empty" colSpan="9">
                Loading. The API sleeps on free hosting, so a cold start takes up to 50 seconds.
              </td>
            </tr>
          )}
          {!loading && trades.length === 0 && (
            <tr>
              <td className="empty" colSpan="9">No trades match. Log one above.</td>
            </tr>
          )}
          {trades.map((t) => (
            <tr key={t.id}>
              <td>{t.instrument}</td>
              <td><span className="tag">{t.direction}</span></td>
              <td className="num">{t.quantity}</td>
              <td className="num">{t.entry_price}</td>
              <td className="num">{t.exit_price}</td>
              <td className={t.pnl >= 0 ? "num profit" : "num loss"}>
                {t.pnl >= 0 ? "+" : ""}{t.pnl.toFixed(2)}
              </td>
              <td>{t.strategy}</td>
              <td>{t.notes}</td>
              <td className="row-actions">
                <button className="link-btn" onClick={() => startEdit(t)}>Edit</button>
                <button className="link-btn danger" onClick={() => deleteTrade(t.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;