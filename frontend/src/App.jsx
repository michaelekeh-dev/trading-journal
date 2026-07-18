import { useState, useEffect } from "react";

function App() {
  const [trades, setTrades] = useState([]);
  const [form, setForm] = useState({
    instrument: "",
    direction: "",
    entry_price: "",
    exit_price: "",
    quantity: "",
    notes: "",
    strategy: "",
  });
  const [stats, setStats] = useState({ total_pnl: 0, win_rate: 0, trade_count: 0 });
  
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
    }).then(() => refresh());
  }


  return (
    <div>
      <button onClick={() => setTrades([])}>Clear</button>

      <input
        name="Positions"
        placeholder="Positions"
        value={form.instrument}
        onChange={(e) => setForm({ ...form, Positions: e.target.value })}
      />
      <input
        name="direction"
        placeholder="Direction"
        value={form.direction}
        onChange={(e) => setForm({ ...form, direction: e.target.value })}
      />
      <input
        name="quantity"
        placeholder="quantity"
        value={form.quantity}
        onChange={(e) => setForm({ ...form, quantity: e.target.value })}
      />
      <input
        name="entry_price"
        placeholder="Entry"
        value={form.entry_price}
        onChange={(e) => setForm({ ...form, entry_price: e.target.value })}
      />
      <input
        name="exit_price"
        placeholder="Exit"
        value={form.exit_price}
        onChange={(e) => setForm({ ...form, exit_price: e.target.value })}
      />
      <input
        name="notes"
        placeholder="Notes"
        value={form.notes}
        onChange={(e) => setForm({ ...form, notes: e.target.value })}
      />
      <input
        name="strategy"
        placeholder="Strategy"
        value={form.strategy}
        onChange={(e) => setForm({ ...form, strategy: e.target.value })}
      />
      <button onClick={addTrade}>Add trade</button>
      <h1>Trading Journal</h1>
      <div>
        <p>Total P&L: ${stats.total_pnl}</p>
        <p>Win rate: {stats.win_rate.toFixed(1)}%</p>
        <p>Trades: {stats.trade_count}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>Positions</th>
            <th>Direction</th>
            <th>Entry</th>
            <th>Exit</th>
            <th>Notes</th>
            <th>Strategy</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((t) => (
            <tr key={t.id}>
              <td>{t.instrument}</td>
              <td>{t.direction}</td>
              <td>{t.entry_price}</td>
              <td>{t.exit_price}</td>
              <td>{t.notes}</td>
              <td>{t.strategy}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

}
export default App;