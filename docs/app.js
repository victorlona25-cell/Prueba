const app = document.getElementById('app');
let page = 'login';
let currentModule = 'Dashboard';
let selectedAsset = 'EUR/USD';
let selectedSide = 'BUY';
let activeTab = 'open';
let balance = 1250;
let positions = [];
let closed = [];
let money = [];

const modules = ['Dashboard','Clientes','Cuentas trading','Depósitos','Retiros','Créditos / Bonos','Operaciones','CRM','Riesgo','Reportes','Configuración','Usuarios admin','Auditoría'];
const assets = [['EUR/USD',1.0854],['GBP/USD',1.2687],['USD/JPY',151.34],['XAU/USD',3042.15],['BTC/USD',84210],['US30',38200],['NAS100',18200],['AAPL',185],['TSLA',210]];

function getPrice(){ return (assets.find(a => a[0] === selectedAsset) || assets[0])[1]; }
function setPage(p){ page = p; render(); }
function now(){ return new Date().toLocaleString(); }
function pnl(){ return positions.reduce((s,p)=>s+p.pnl,0); }
function margin(){ return positions.reduce((s,p)=>s+p.lots*50,0); }
function equity(){ return balance + pnl(); }
function freeMargin(){ return equity() - margin(); }

function renderLogin(){
  app.innerHTML = `
    <div class="login"><div class="card" style="width:390px">
      <h2 style="color:#00d4a0;text-align:center">FOREX ACCESS</h2>
      <p style="text-align:center;color:#5a6e8a">WebTrade + CRM</p>
      <input id="u" class="input" placeholder="Usuario"><br><br>
      <input id="p" class="input" type="password" placeholder="Contraseña">
      <div id="err" class="error" style="display:none"></div>
      <button id="loginBtn" class="btn green" style="width:100%;padding:12px">ENTRAR</button>
      <p style="font-size:11px;color:#5a6e8a;text-align:center">Admin: admin / 123456 · Cliente: cliente / 123456</p>
      <p style="font-size:10px;color:#5a6e8a;text-align:center">El trading conlleva riesgo. Puedes perder todo tu capital.</p>
    </div></div>`;
  document.getElementById('loginBtn').addEventListener('click', () => {
    const u = document.getElementById('u').value.trim();
    const p = document.getElementById('p').value.trim();
    if (u === 'admin' && p === '123456') { setPage('admin'); return; }
    if (u === 'cliente' && p === '123456') { setPage('trade'); return; }
    const err = document.getElementById('err');
    err.style.display = 'block';
    err.innerText = 'Credenciales incorrectas o vacías.';
  });
}

function renderAdmin(){
  app.innerHTML = `
    <div class="app">
      <div class="top"><div><b style="color:#00d4a0">ADMIN CRM</b><br><button id="logout" class="btn red">CERRAR SESIÓN</button></div><b>${currentModule}</b></div>
      <div class="main">
        <div class="side" id="moduleList"></div>
        <div class="content" style="overflow:auto">
          <div class="panel"><h2 style="color:#63b3ed">${currentModule}</h2><div class="grid">
            <div class="panel">Crear / editar registros</div><div class="panel">Estados y validaciones</div><div class="panel">Historial de actividad</div><div class="panel">Auditoría futura</div>
          </div></div>
          <div id="extra"></div>
        </div>
      </div>
    </div>`;
  document.getElementById('logout').addEventListener('click', () => setPage('login'));
  const list = document.getElementById('moduleList');
  modules.forEach(m => {
    const div = document.createElement('div');
    div.className = 'item ' + (m === currentModule ? 'active' : '');
    div.innerText = m;
    div.addEventListener('click', () => { currentModule = m; render(); });
    list.appendChild(div);
  });
  if (currentModule === 'Clientes') {
    document.getElementById('extra').innerHTML = '<div class="panel" style="margin-top:12px"><h3>Cliente Demo</h3><p>Usuario: cliente</p><p>Estado: Activo</p><p>KYC: Pendiente</p><p>Asesor: Víctor</p></div>';
  }
}

function renderTrade(){
  app.innerHTML = `
    <div class="app">
      <div class="top">
        <div><b style="color:#00d4a0">WEBTRADE</b><br><button id="logout" class="btn red">CERRAR SESIÓN</button></div>
        <div><button id="deposit" class="btn green">+$ DEPÓSITO</button><button id="withdraw" class="btn yellow">-$ RETIRO</button></div>
        <div>${[['Balance',balance],['Equity',equity()],['Margin',margin()],['Free Margin',freeMargin()],['P&L',pnl()]].map(([m,v])=>`<span class="metric" style="display:inline-block;margin:0 10px"><small>${m}</small><b>$${v.toFixed(2)}</b></span>`).join('')}</div>
      </div>
      <div class="main">
        <div class="side" id="assetList"></div>
        <div class="content">
          <div class="chartBox"><div class="chartHead"><div><b>${selectedAsset}</b><div style="color:#5a6e8a;font-size:11px">Velas japonesas simuladas · M5</div></div><div class="price">${getPrice()}</div></div><canvas id="chart" width="1000" height="520"></canvas></div>
          <div class="tabs"><button id="tabOpen" class="tab">Abiertas</button><button id="tabClosed" class="tab">Cerradas</button><button id="tabMoney" class="tab">Dinero</button></div>
          <div id="tabContent" class="scroll"></div>
        </div>
        <div class="right"><div class="panel"><h3>Nueva orden</h3><button id="buy" class="btn green">BUY</button><button id="sell" class="btn red">SELL</button><br><br><input id="lots" class="input" value="0.01"><div id="orderError" class="error" style="display:none"></div><br><button id="exec" class="btn blue" style="width:100%">EJECUTAR ${selectedSide}</button></div></div>
      </div>
    </div>`;
  document.getElementById('logout').addEventListener('click', () => setPage('login'));
  document.getElementById('deposit').addEventListener('click', () => renderMoneyForm('Depósito'));
  document.getElementById('withdraw').addEventListener('click', () => renderMoneyForm('Retiro'));
  document.getElementById('buy').addEventListener('click', () => { selectedSide='BUY'; render(); });
  document.getElementById('sell').addEventListener('click', () => { selectedSide='SELL'; render(); });
  document.getElementById('exec').addEventListener('click', executeOrder);
  document.getElementById('tabOpen').addEventListener('click', () => { activeTab='open'; renderTabs(); });
  document.getElementById('tabClosed').addEventListener('click', () => { activeTab='closed'; renderTabs(); });
  document.getElementById('tabMoney').addEventListener('click', () => { activeTab='money'; renderTabs(); });
  const list = document.getElementById('assetList');
  assets.forEach(a => {
    const div = document.createElement('div');
    div.className = 'item ' + (a[0] === selectedAsset ? 'active' : '');
    div.innerHTML = a[0] + '<br><small>' + a[1] + '</small>';
    div.addEventListener('click', () => { selectedAsset = a[0]; render(); });
    list.appendChild(div);
  });
  drawChart();
  renderTabs();
}

function renderMoneyForm(type){
  app.innerHTML = `<div class="app"><div class="top"><button id="back" class="btn blue">VOLVER</button><b>${type}</b></div><div class="login"><div class="card" style="width:420px"><h3>Solicitud de ${type}</h3><input id="moneyAmount" class="input" type="number" placeholder="Monto USD"><br><br><button id="confirmMoney" class="btn green" style="width:100%;padding:12px">CONFIRMAR</button></div></div></div>`;
  document.getElementById('back').addEventListener('click', () => setPage('trade'));
  document.getElementById('confirmMoney').addEventListener('click', () => {
    const amount = Number(document.getElementById('moneyAmount').value);
    if (!amount || amount <= 0) return;
    money.unshift({type, amount, status: type === 'Depósito' ? 'Pendiente de autorización' : 'Solicitud pendiente', time: now()});
    if (type === 'Retiro') balance -= amount;
    activeTab = 'money';
    setPage('trade');
  });
}

function executeOrder(){
  const vol = Number(document.getElementById('lots').value);
  const err = document.getElementById('orderError');
  if (!vol || vol <= 0) { err.style.display='block'; err.innerText='Volumen inválido.'; return; }
  if (freeMargin() < vol * 50) { err.style.display='block'; err.innerText='Saldo o margen insuficiente.'; return; }
  positions.unshift({id: Date.now(), symbol:selectedAsset, side:selectedSide, lots:vol, pnl:0, time:now()});
  activeTab='open';
  render();
}

function renderTabs(){
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  if (activeTab==='open') document.getElementById('tabOpen').classList.add('active');
  if (activeTab==='closed') document.getElementById('tabClosed').classList.add('active');
  if (activeTab==='money') document.getElementById('tabMoney').classList.add('active');
  const box = document.getElementById('tabContent');
  if (activeTab==='open') box.innerHTML = table(positions.map(p=>[p.symbol,p.side,p.lots,'$'+p.pnl.toFixed(2),'<button class="btn red" data-close="'+p.id+'">Cerrar</button>']), ['Símbolo','Lado','Lotes','P&L','']);
  if (activeTab==='closed') box.innerHTML = table(closed.map(p=>[p.symbol,p.side,p.lots,p.time]), ['Símbolo','Lado','Lotes','Hora']);
  if (activeTab==='money') box.innerHTML = table(money.map(m=>[m.type,'$'+m.amount.toFixed(2),m.status,m.time]), ['Tipo','Monto','Estado','Fecha']);
  box.querySelectorAll('[data-close]').forEach(btn=>btn.addEventListener('click',()=>closePosition(Number(btn.dataset.close))));
}

function closePosition(id){
  const idx = positions.findIndex(p=>p.id===id);
  if (idx<0) return;
  const p = positions.splice(idx,1)[0];
  closed.unshift({...p, time:now()});
  balance += p.pnl;
  activeTab='closed';
  render();
}

function table(rows, headers){
  if(!rows.length) return '<div class="item">Sin registros</div>';
  return '<table class="table"><thead><tr>'+headers.map(h=>'<th>'+h+'</th>').join('')+'</tr></thead><tbody>'+rows.map(r=>'<tr>'+r.map(c=>'<td>'+c+'</td>').join('')+'</tr>').join('')+'</tbody></table>';
}

function drawChart(){
  const c=document.getElementById('chart'); if(!c)return;
  const ctx=c.getContext('2d'),W=c.width,H=c.height;
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#060d1a';ctx.fillRect(0,0,W,H);
  const left=55,right=70,top=20,bottom=40,cw=W-left-right,ch=H-top-bottom;
  let base=getPrice(),data=[],p=base;
  for(let i=0;i<70;i++){let o=p,change=(Math.random()-0.48)*base*0.004,close=o+change,high=Math.max(o,close)+Math.random()*base*0.0015,low=Math.min(o,close)-Math.random()*base*0.0015;data.push({o,close,high,low});p=close}
  let min=Math.min(...data.map(d=>d.low)),max=Math.max(...data.map(d=>d.high)),range=max-min||1;
  const y=v=>top+ch-((v-min)/range)*ch;
  for(let i=0;i<=6;i++){let yy=top+i*ch/6;ctx.strokeStyle='#111d30';ctx.beginPath();ctx.moveTo(left,yy);ctx.lineTo(W-right,yy);ctx.stroke();let label=max-i*range/6;ctx.fillStyle='#5a6e8a';ctx.font='12px Courier New';ctx.textAlign='right';ctx.fillText(label.toFixed(base>100?2:5),left-6,yy+4)}
  let step=cw/data.length;
  data.forEach((d,i)=>{let x=left+i*step+step/2,bull=d.close>=d.o,col=bull?'#00d4a0':'#f05e5e';ctx.strokeStyle=col;ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(x,y(d.high));ctx.lineTo(x,y(d.low));ctx.stroke();let tb=y(Math.max(d.o,d.close)),bb=y(Math.min(d.o,d.close)),h=Math.max(bb-tb,2),w=Math.max(step*.55,3);bull?ctx.strokeRect(x-w/2,tb,w,h):ctx.fillRect(x-w/2,tb,w,h)});
}

function render(){ if(page==='login') renderLogin(); else if(page==='admin') renderAdmin(); else renderTrade(); }
render();
