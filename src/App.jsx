import { useState } from 'react';
import { ADMIN_MENU, MODULES } from './modules.js';

export default function App() {
  const [page, setPage] = useState('login');
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [adminView, setAdminView] = useState('Dashboard');

  function login() {
    if (!user || !pass) {
      setError('Debes ingresar usuario y contraseña.');
      return;
    }
    if (user === 'admin' && pass === '123456') {
      setError('');
      setPage('admin');
      return;
    }
    if (user === 'cliente' && pass === '123456') {
      setError('');
      setPage('webtrade');
      return;
    }
    setError('Credenciales incorrectas.');
  }

  function logout() {
    setUser('');
    setPass('');
    setError('');
    setPage('login');
  }

  if (page === 'login') {
    return (
      <div className="login">
        <div className="card" style={{ width: 380 }}>
          <h2 style={{ color: '#00d4a0', textAlign: 'center' }}>FOREX ACCESS</h2>
          <input className="input" placeholder="Usuario" value={user} onChange={(e) => setUser(e.target.value)} />
          <br /><br />
          <input className="input" placeholder="Contraseña" type="password" value={pass} onChange={(e) => setPass(e.target.value)} />
          {error && <div className="error">{error}</div>}
          <br />
          <button className="btn green" style={{ width: '100%', padding: 12 }} onClick={login}>ENTRAR</button>
          <p style={{ color: '#5a6e8a', fontSize: 10, textAlign: 'center' }}>Admin: admin / 123456 - Cliente: cliente / 123456</p>
        </div>
      </div>
    );
  }

  if (page === 'admin') {
    const items = MODULES[adminView] || [];
    return (
      <div className="app">
        <div className="topbar">
          <div>
            <b style={{ color: '#00d4a0' }}>ADMIN CRM</b>
            <div style={{ color: '#5a6e8a', fontSize: 10 }}>{adminView}</div>
          </div>
          <button className="btn red" onClick={logout}>CERRAR SESIÓN</button>
        </div>
        <div className="main">
          <div className="sidebar">
            {ADMIN_MENU.map((x) => (
              <div
                key={x}
                className={`sideitem ${adminView === x ? 'active' : ''}`}
                onClick={() => setAdminView(x)}
              >
                {x}
              </div>
            ))}
          </div>
          <div className="content">
            <div className="panel">
              <h2 style={{ color: '#63b3ed', marginTop: 0 }}>{adminView}</h2>
              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                {items.map((item) => (
                  <div key={item} className="panel" style={{ background: '#0b1525' }}>
                    {item}
                  </div>
                ))}
              </div>
            </div>
            {adminView === 'Clientes' && (
              <div className="panel" style={{ marginTop: 12 }}>
                <h3>Cliente demo</h3>
                <table className="table">
                  <tbody>
                    <tr><td>Nombre</td><td>Cliente Demo</td></tr>
                    <tr><td>Usuario</td><td>cliente</td></tr>
                    <tr><td>Estado</td><td>Activo</td></tr>
                    <tr><td>KYC</td><td>Pendiente</td></tr>
                    <tr><td>Asesor</td><td>Victor</td></tr>
                    <tr><td>Ultimo acceso</td><td>Sin registro</td></tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="topbar">
        <b style={{ color: '#00d4a0' }}>WEBTRADE</b>
        <button className="btn red" onClick={logout}>CERRAR SESIÓN</button>
      </div>
      <div className="main">
        <div className="market">
          {['EUR/USD','GBP/USD','USD/JPY','XAU/USD','BTC/USD','US30','NAS100','AAPL','TSLA'].map((x) => <div key={x} className="sideitem">{x}</div>)}
        </div>
        <div className="content">
          <div className="panel">WebTrade funcional base para cliente.</div>
        </div>
      </div>
    </div>
  );
}
