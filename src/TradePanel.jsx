import { INSTRUMENTS } from './markets.js';
import { money } from './config.js';

export default function TradePanel({ client, account, market, setMarket, symbol, setSymbol, side, setSide, lots, setLots, tab, setTab, executeOrder, closePosition, setPage, logout, error }) {
  const instrument = INSTRUMENTS.find((i) => i.symbol === symbol) || INSTRUMENTS[0];
  const filtered = INSTRUMENTS.filter((i) => market === 'All' || i.market === market);
  const margin = account.positions.reduce((s, p) => s + p.lots * 50, 0);
  const pnl = account.positions.reduce((s, p) => s + p.pnl, 0);
  const equity = account.balance + account.credit + pnl;
  const freeMargin = equity - margin;

  return (
    <div className="app">
      <div className="topbar">
        <div>
          <b style={{ color: '#00d4a0' }}>WEBTRADE</b><br />
          <button className="btn red" onClick={logout}>CERRAR SESIÓN</button>
        </div>
        <div>
          WebTrader <b style={{ color: '#63b3ed' }}>{client?.name}</b>{' '}
          <button className="btn green" onClick={() => setPage('deposit')}>+$</button>{' '}
          <button className="btn yellow" onClick={() => setPage('withdraw')}>-$</button>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          {[
            ['Balance', account.balance],
            ['Equity', equity],
            ['Margin', margin],
            ['Free Margin', freeMargin],
            ['P&L', pnl],
          ].map(([label, value]) => <div className="metric" key={label}><small>{label}</small><b>${money(value)}</b></div>)}
        </div>
      </div>

      <div className="main">
        <div className="market">
          <div style={{ padding: 8 }}>
            {['All','Forex','Metals','Crypto','Indices','Stocks'].map((m) => <button key={m} className={`btn ${market === m ? 'blue' : ''}`} onClick={() => setMarket(m)}>{m}</button>)}
          </div>
          {filtered.map((i) => (
            <div key={i.symbol} className={`sideitem ${symbol === i.symbol ? 'active' : ''}`} onClick={() => setSymbol(i.symbol)}>
              {i.symbol}<br /><small>{i.market} · {i.price}</small>
            </div>
          ))}
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div className="chart">
            <div style={{ textAlign: 'center' }}>
              <h2>{symbol}</h2>
              <h1 style={{ color: '#63b3ed' }}>{instrument.price}</h1>
              <p>Gráfica simulada de velas japonesas · M1 M5 M15 H1 D1</p>
            </div>
          </div>
          <div className="tabs">
            {[
              ['positions','Abiertas'],
              ['history','Cerradas'],
              ['money','Dinero'],
            ].map(([k, label]) => <button key={k} className={`tab ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>{label}</button>)}
          </div>
          <div style={{ height: 180, overflow: 'auto' }}>
            {tab === 'positions' && <table className="table"><tbody>{account.positions.map((p) => <tr key={p.id}><td>{p.symbol}</td><td>{p.side}</td><td>{p.lots}</td><td><button className="btn red" onClick={() => closePosition(p.id)}>Cerrar</button></td></tr>)}{!account.positions.length && <tr><td>Sin posiciones abiertas</td></tr>}</tbody></table>}
            {tab === 'history' && <table className="table"><tbody>{account.closed.map((p) => <tr key={p.id}><td>{p.symbol}</td><td>{p.status}</td><td>{p.closeTime}</td></tr>)}{!account.closed.length && <tr><td>Sin operaciones cerradas</td></tr>}</tbody></table>}
            {tab === 'money' && <table className="table"><tbody>{account.movements.map((m, i) => <tr key={i}><td>{m.type}</td><td>${money(m.amount)}</td><td>{m.status}</td><td>{m.time}</td></tr>)}{!account.movements.length && <tr><td>Sin movimientos</td></tr>}</tbody></table>}
          </div>
        </div>

        <div className="order">
          <h3>Nueva orden</h3>
          <b>{symbol}</b>
          <p>{side}</p>
          <button className="btn green" onClick={() => setSide('BUY')}>BUY</button>
          <button className="btn red" onClick={() => setSide('SELL')}>SELL</button>
          <br /><br />
          <input className="input" value={lots} onChange={(e) => setLots(e.target.value)} />
          {error && <div className="error">{error}</div>}
          <br /><br />
          <button className={`btn ${side === 'BUY' ? 'green' : 'red'}`} style={{ width: '100%', padding: 12 }} onClick={executeOrder}>{side === 'BUY' ? 'COMPRAR' : 'VENDER'}</button>
        </div>
      </div>
    </div>
  );
}
