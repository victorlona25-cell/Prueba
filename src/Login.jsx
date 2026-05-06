export default function Login({ user, pass, error, setUser, setPass, onLogin }) {
  return (
    <div className="login">
      <div className="card" style={{ width: 390 }}>
        <h2 style={{ color: '#00d4a0', textAlign: 'center' }}>FOREX ACCESS</h2>
        <p style={{ color: '#5a6e8a', textAlign: 'center' }}>WebTrade + CRM</p>
        <input className="input" placeholder="Usuario" value={user} onChange={(e) => setUser(e.target.value)} />
        <br /><br />
        <input className="input" placeholder="Contraseña" type="password" value={pass} onChange={(e) => setPass(e.target.value)} />
        {error && <div className="error">{error}</div>}
        <br />
        <button className="btn green" style={{ width: '100%', padding: 12 }} onClick={onLogin}>ENTRAR</button>
        <p style={{ color: '#5a6e8a', fontSize: 10, textAlign: 'center' }}>Admin: admin / 123456 · Cliente: cliente / 123456</p>
        <p style={{ color: '#5a6e8a', fontSize: 10, textAlign: 'center' }}>El trading conlleva riesgo. Puedes perder todo tu capital.</p>
      </div>
    </div>
  );
}
