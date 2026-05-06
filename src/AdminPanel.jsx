import { ADMIN_MENU, MODULES } from './modules.js';

export default function AdminPanel({ view, setView, clients, selectedClientId, setSelectedClientId, form, setForm, createClient, updateClient, logout }) {
  const client = clients.find((c) => c.id === selectedClientId) || clients[0];
  const items = MODULES[view] || [];

  return (
    <div className="app">
      <div className="topbar">
        <div>
          <b style={{ color: '#00d4a0' }}>ADMIN CRM</b>
          <div style={{ color: '#5a6e8a', fontSize: 10 }}>{view}</div>
        </div>
        <button className="btn red" onClick={logout}>CERRAR SESIÓN</button>
      </div>
      <div className="main">
        <div className="sidebar">
          {ADMIN_MENU.map((item) => (
            <div key={item} className={`sideitem ${view === item ? 'active' : ''}`} onClick={() => setView(item)}>{item}</div>
          ))}
        </div>
        <div className="content">
          <div className="panel">
            <h2 style={{ color: '#63b3ed', marginTop: 0 }}>{view}</h2>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
              {items.map((item) => <div key={item} className="panel" style={{ background: '#0b1525' }}>{item}</div>)}
            </div>
          </div>

          {view === 'Clientes' && (
            <div className="grid" style={{ gridTemplateColumns: '300px 1fr', marginTop: 12 }}>
              <div className="panel">
                <h3>Crear cliente</h3>
                {['name','email','phone','country','user','pass','advisor'].map((k) => (
                  <input key={k} className="input" style={{ marginBottom: 7 }} placeholder={k} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
                ))}
                <button className="btn green" onClick={createClient}>CREAR CLIENTE</button>
                <h3>Clientes</h3>
                {clients.map((c) => (
                  <div key={c.id} className={`sideitem ${selectedClientId === c.id ? 'active' : ''}`} onClick={() => setSelectedClientId(c.id)}>
                    {c.name}<br /><small>{c.user} · {c.status}</small>
                  </div>
                ))}
              </div>

              {client && (
                <div className="panel">
                  <h3>{client.name}</h3>
                  <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                    {['name','email','phone','country','user','pass','advisor'].map((k) => (
                      <input key={k} className="input" value={client[k] || ''} onChange={(e) => updateClient(k, e.target.value)} />
                    ))}
                  </div>
                  <br />
                  <select className="input" value={client.kyc} onChange={(e) => updateClient('kyc', e.target.value)}>
                    <option>Pendiente</option><option>Verificado</option><option>Rechazado</option>
                  </select>
                  <br /><br />
                  {['Activo','Pendiente','Bloqueado','Suspendido'].map((s) => <button key={s} className="btn blue" onClick={() => updateClient('status', s)}>{s}</button>)}
                  <br /><br />
                  <div className="panel">IP: {client.ip}<br />Dispositivo: {client.device}<br />Último acceso: {client.lastAccess}</div>
                  <br />
                  <div className="panel"><b>Actividad</b>{client.activity.map((a, i) => <div key={i}>{a}</div>)}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
