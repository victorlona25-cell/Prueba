import { useState } from 'react';

export default function App() {
  const [page, setPage] = useState('login');
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');

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
          <p style={{ color: '#5a6e8a', fontSize: 10, textAlign: 'center' }}>Admin: admin / 123456 · Cliente: cliente / 123456</p>
        </div>
      </div>
    );
  }

  if (page === 'admin') {
    return (
      <div className="app">
        <div className="topbar">
          <b style={{ color: '#00d4a0' }}>ADMIN CRM</b>
          <button className="btn red" onClick={() => setPage('login')}>CERRAR SESIÓN</button>
        </div>
        <div className="main">
          <div className="sidebar">
            {['Dashboard','Clientes','Cuentas trading','Depósitos','Retiros','Créditos / Bonos','Operaciones','CRM','Riesgo','Reportes','Configuración','Usuarios admin','Auditoría'].map((x) => <div key={x} className="sideitem">{x}</div>)}
          </div>
          <div className="content">
            <div className="panel">Panel administrador funcional. Siguiente paso: conectar módulos de clientes y cuentas.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="topbar">
        <b style={{ color: '#00d4a0' }}>WEBTRADE</b>
        <button className="btn red" onClick={() => setPage('login')}>CERRAR SESIÓN</button>
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
