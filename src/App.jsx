import { useState } from 'react';
import Login from './Login.jsx';
import AdminPanel from './AdminPanel.jsx';
import TradePanel from './TradePanel.jsx';
import { ADMIN_USER, ADMIN_PASS, createAccount, now } from './config.js';
import { INSTRUMENTS } from './markets.js';

const demo = { id: 1, name: 'Cliente Demo', email: 'cliente@demo.com', phone: '+52 555 000 0000', country: 'Mexico', user: 'cliente', pass: '123456', status: 'Activo', kyc: 'Pendiente', advisor: 'Victor', ip: 'Sin registro', device: 'Sin registro', lastAccess: 'Nunca', activity: ['Cuenta creada'] };

export default function App() {
  const [page, setPage] = useState('login');
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [adminView, setAdminView] = useState('Dashboard');
  const [clients, setClients] = useState([demo]);
  const [accounts, setAccounts] = useState({ 1: createAccount() });
  const [selectedClientId, setSelectedClientId] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', phone: '', country: '', user: '', pass: '', advisor: 'Victor' });
  const [market, setMarket] = useState('All');
  const [symbol, setSymbol] = useState('EUR/USD');
  const [side, setSide] = useState('BUY');
  const [lots, setLots] = useState('0.01');
  const [tab, setTab] = useState('positions');
  const [amount, setAmount] = useState('');

  const client = clients.find(c => c.id === selectedClientId) || clients[0];
  const account = accounts[selectedClientId] || createAccount();
  const instrument = INSTRUMENTS.find(i => i.symbol === symbol) || INSTRUMENTS[0];
  const margin = account.positions.reduce((s, p) => s + p.lots * 50, 0);
  const pnl = account.positions.reduce((s, p) => s + p.pnl, 0);
  const equity = account.balance + account.credit + pnl;
  const freeMargin = equity - margin;

  function saveAccount(patch) { setAccounts(prev => ({ ...prev, [selectedClientId]: { ...account, ...patch } })); }
  function logout() { setUser(''); setPass(''); setError(''); setPage('login'); }
  function doLogin() {
    if (!user || !pass) return setError('Debes ingresar usuario y contraseña.');
    if (user === ADMIN_USER && pass === ADMIN_PASS) { setError(''); setPage('admin'); return; }
    const found = clients.find(c => c.user === user && c.pass === pass && c.status === 'Activo');
    if (!found) return setError('Credenciales incorrectas o cliente no activo.');
    setSelectedClientId(found.id);
    setClients(prev => prev.map(c => c.id === found.id ? { ...c, lastAccess: now(), activity: ['Login cliente', ...c.activity] } : c));
    setError(''); setPage('trade');
  }
  function createClient() {
    if (!form.name || !form.user || !form.pass) return;
    const id = Date.now();
    const next = { id, ...form, status: 'Activo', kyc: 'Pendiente', ip: 'Sin registro', device: 'Sin registro', lastAccess: 'Nunca', activity: ['Cliente creado'] };
    setClients(prev => [next, ...prev]);
    setAccounts(prev => ({ ...prev, [id]: createAccount() }));
    setSelectedClientId(id);
    setForm({ name: '', email: '', phone: '', country: '', user: '', pass: '', advisor: 'Victor' });
  }
  function updateClient(field, value) { setClients(prev => prev.map(c => c.id === selectedClientId ? { ...c, [field]: value, activity: ['Editado: ' + field, ...c.activity] } : c)); }
  function executeOrder() {
    const volume = Number(lots);
    if (!volume || volume <= 0) return setError('Volumen invalido.');
    if (freeMargin < volume * 50) return setError('Saldo o margen insuficiente.');
    const pos = { id: Date.now(), symbol, side, lots: volume, open: instrument.price, pnl: 0, time: now() };
    saveAccount({ positions: [pos, ...account.positions], audit: ['Orden ' + side + ' ' + symbol, ...account.audit] });
    setError('');
  }
  function closePosition(id) {
    const pos = account.positions.find(p => p.id === id); if (!pos) return;
    saveAccount({ balance: account.balance + pos.pnl, positions: account.positions.filter(p => p.id !== id), closed: [{ ...pos, status: 'Cerrada', closeTime: now() }, ...account.closed] });
  }
  function sendMoney(type) {
    const value = Number(amount); if (!value || value <= 0) return;
    const item = { type, amount: value, status: type === 'Deposito' ? 'Pendiente de autorizacion' : 'Solicitud pendiente', time: now() };
    saveAccount({ movements: [item, ...account.movements] });
    setAmount(''); setPage('trade'); setTab('money');
  }

  if (page === 'login') return <Login user={user} pass={pass} error={error} setUser={setUser} setPass={setPass} onLogin={doLogin} />;
  if (page === 'admin') return <AdminPanel view={adminView} setView={setAdminView} clients={clients} selectedClientId={selectedClientId} setSelectedClientId={setSelectedClientId} form={form} setForm={setForm} createClient={createClient} updateClient={updateClient} logout={logout} />;
  if (page === 'deposit' || page === 'withdraw') return <div className="app"><div className="topbar"><button className="btn blue" onClick={() => setPage('trade')}>VOLVER</button><b>{page === 'deposit' ? 'DEPOSITO' : 'RETIRO'}</b></div><div className="login"><div className="card" style={{ width: 420 }}><h3>Solicitud simulada</h3><input className="input" type="number" placeholder="Monto USD" value={amount} onChange={e => setAmount(e.target.value)} /><br /><br /><button className="btn green" style={{ width: '100%', padding: 12 }} onClick={() => sendMoney(page === 'deposit' ? 'Deposito' : 'Retiro')}>CONFIRMAR</button></div></div></div>;
  return <TradePanel client={client} account={account} market={market} setMarket={setMarket} symbol={symbol} setSymbol={setSymbol} side={side} setSide={setSide} lots={lots} setLots={setLots} tab={tab} setTab={setTab} executeOrder={executeOrder} closePosition={closePosition} setPage={setPage} logout={logout} error={error} />;
}
