const app = document.getElementById('app');
const STORAGE_KEY = 'webtrade_crm_state_v1';

let page = 'login';
let currentModule = 'Dashboard';
let selectedAsset = 'EUR/USD';
let selectedSide = 'BUY';
let activeTab = 'open';
let selectedClientId = 1;
let currentUserId = 1;

const modules = ['Dashboard','Clientes','Cuentas trading','Depósitos','Retiros','Créditos / Bonos','Operaciones','CRM','Riesgo','Reportes','Configuración','Usuarios admin','Auditoría'];
const assets = [['EUR/USD',1.0854],['GBP/USD',1.2687],['USD/JPY',151.34],['XAU/USD',3042.15],['BTC/USD',84210],['US30',38200],['NAS100',18200],['AAPL',185],['TSLA',210]];

function defaultAccount(){ return { balance:1250, positions:[], closed:[], money:[], audit:[] }; }
function defaultState(){ return { clients:[{ id:1, name:'Cliente Demo', user:'cliente', pass:'123456', status:'Activo', kyc:'Pendiente', advisor:'Víctor', email:'cliente@demo.com', phone:'+52 555 000 0000', country:'México', lastAccess:'Nunca', activity:['Cuenta creada'] }], accounts:{ 1: defaultAccount() } }; }
let state = loadState();

function loadState(){ try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultState(); } catch(e){ return defaultState(); } }
function saveState(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function now(){ return new Date().toLocaleString(); }
function getPrice(){ return (assets.find(a => a[0] === selectedAsset) || assets[0])[1]; }
function client(id = selectedClientId){ return state.clients.find(c => c.id === id) || state.clients[0]; }
function account(id = currentUserId){ if(!state.accounts[id]) state.accounts[id] = defaultAccount(); return state.accounts[id]; }
function pnl(acc = account()){ return acc.positions.reduce((s,p)=>s+p.pnl,0); }
function margin(acc = account()){ return acc.positions.reduce((s,p)=>s+p.lots*50,0); }
function equity(acc = account()){ return acc.balance + pnl(acc); }
function freeMargin(acc = account()){ return equity(acc) - margin(acc); }
function setPage(p){ page=p; render(); }
function logout(){ page='login'; currentUserId=1; render(); }

function renderLogin(){
  app.innerHTML = `<div class="login"><div class="card" style="width:390px"><h2 style="color:#00d4a0;text-align:center">FOREX ACCESS</h2><p style="text-align:center;color:#5a6e8a">WebTrade + CRM</p><input id="u" class="input" placeholder="Usuario"><br><br><input id="p" class="input" type="password" placeholder="Contraseña"><div id="err" class="error" style="display:none"></div><button id="loginBtn" class="btn green" style="width:100%;padding:12px">ENTRAR</button><p style="font-size:11px;color:#5a6e8a;text-align:center">Admin: admin / 123456 · Cliente: cliente / 123456</p><p style="font-size:10px;color:#5a6e8a;text-align:center">Los datos se guardan localmente en este navegador.</p></div></div>`;
  document.getElementById('loginBtn').onclick = () => {
    const u=document.getElementById('u').value.trim(); const p=document.getElementById('p').value.trim();
    if(u==='admin' && p==='123456'){ page='admin'; render(); return; }
    const found = state.clients.find(c => c.user === u && c.pass === p && c.status === 'Activo');
    if(found){ currentUserId=found.id; selectedClientId=found.id; found.lastAccess=now(); found.activity.unshift('Login cliente'); saveState(); page='trade'; render(); return; }
    const err=document.getElementById('err'); err.style.display='block'; err.innerText='Credenciales incorrectas o cliente no activo.';
  };
}

function renderAdmin(){
  const c = client();
  app.innerHTML = `<div class="app"><div class="top"><div><b style="color:#00d4a0">ADMIN CRM</b><br><button id="logout" class="btn red">CERRAR SESIÓN</button></div><b>${currentModule}</b></div><div class="main"><div class="side" id="moduleList"></div><div class="content" style="overflow:auto"><div class="panel"><h2 style="color:#63b3ed">${currentModule}</h2><div class="grid"><div class="panel">Clientes: ${state.clients.length}</div><div class="panel">Cuentas activas: ${Object.keys(state.accounts).length}</div><div class="panel">Datos persistentes: localStorage</div><div class="panel">Última acción: ${now()}</div></div></div><div id="adminExtra"></div></div></div></div>`;
  document.getElementById('logout').onclick=logout;
  const list=document.getElementById('moduleList');
  modules.forEach(m=>{ const div=document.createElement('div'); div.className='item '+(m===currentModule?'active':''); div.innerText=m; div.onclick=()=>{ currentModule=m; render(); }; list.appendChild(div); });
  if(currentModule==='Clientes') renderClientsModule(c);
  if(currentModule==='Cuentas trading') renderAccountsModule();
  if(currentModule==='Depósitos') renderMovementsModule('Depósito');
  if(currentModule==='Retiros') renderMovementsModule('Retiro');
  if(currentModule==='Operaciones') renderOperationsModule();
  if(currentModule==='Auditoría') renderAuditModule();
}

function renderClientsModule(c){
  document.getElementById('adminExtra').innerHTML = `<div class="grid" style="grid-template-columns:300px 1fr;margin-top:12px"><div class="panel"><h3>Crear cliente</h3><input id="newName" class="input" placeholder="Nombre"><br><br><input id="newUser" class="input" placeholder="Usuario"><br><br><input id="newPass" class="input" placeholder="Contraseña"><br><br><input id="newEmail" class="input" placeholder="Correo"><br><br><button id="createClient" class="btn green" style="width:100%">CREAR CLIENTE</button><h3>Clientes</h3><div id="clientList"></div></div><div class="panel"><h3>Editar cliente</h3><label>Nombre</label><input id="editName" class="input" value="${c.name}"><br><br><label>Usuario</label><input id="editUser" class="input" value="${c.user}"><br><br><label>Contraseña</label><input id="editPass" class="input" value="${c.pass}"><br><br><label>Estado</label><select id="editStatus" class="input"><option>Activo</option><option>Pendiente</option><option>Bloqueado</option><option>Suspendido</option></select><br><br><label>KYC</label><select id="editKyc" class="input"><option>Pendiente</option><option>Verificado</option><option>Rechazado</option></select><br><br><button id="saveClient" class="btn blue">GUARDAR CAMBIOS</button><div class="warn">Acceso del cliente: ${c.user} / ${c.pass}</div><div class="panel">Último acceso: ${c.lastAccess}<br>Asesor: ${c.advisor || 'Víctor'}</div></div></div>`;
  document.getElementById('editStatus').value=c.status;
  document.getElementById('editKyc').value=c.kyc;
  const list=document.getElementById('clientList');
  state.clients.forEach(x=>{ const div=document.createElement('div'); div.className='item '+(x.id===selectedClientId?'active':''); div.innerHTML=`${x.name}<br><small>${x.user} · ${x.status}</small>`; div.onclick=()=>{ selectedClientId=x.id; render(); }; list.appendChild(div); });
  document.getElementById('createClient').onclick=()=>{
    const name=document.getElementById('newName').value.trim(); const user=document.getElementById('newUser').value.trim(); const pass=document.getElementById('newPass').value.trim(); const email=document.getElementById('newEmail').value.trim();
    if(!name || !user || !pass){ alert('Nombre, usuario y contraseña son obligatorios.'); return; }
    if(state.clients.some(x=>x.user===user)){ alert('Ese usuario ya existe.'); return; }
    const id=Date.now();
    const next={ id, name, user, pass, email, phone:'', country:'', status:'Activo', kyc:'Pendiente', advisor:'Víctor', lastAccess:'Nunca', activity:['Cliente creado'] };
    state.clients.unshift(next); state.accounts[id]=defaultAccount(); selectedClientId=id; saveState(); render();
  };
  document.getElementById('saveClient').onclick=()=>{
    c.name=document.getElementById('editName').value.trim(); c.user=document.getElementById('editUser').value.trim(); c.pass=document.getElementById('editPass').value.trim(); c.status=document.getElementById('editStatus').value; c.kyc=document.getElementById('editKyc').value; c.activity.unshift('Datos actualizados'); saveState(); render();
  };
}

function renderAccountsModule(){
  document.getElementById('adminExtra').innerHTML = `<div class="panel" style="margin-top:12px"><h3>Cuentas trading</h3><table class="table"><thead><tr><th>Cliente</th><th>Balance</th><th>Equity</th><th>Margen</th><th>Libre</th><th>Posiciones</th></tr></thead><tbody>${state.clients.map(c=>{ const a=account(c.id); return `<tr><td>${c.name}</td><td>$${a.balance.toFixed(2)}</td><td>$${equity(a).toFixed(2)}</td><td>$${margin(a).toFixed(2)}</td><td>$${freeMargin(a).toFixed(2)}</td><td>${a.positions.length}</td></tr>`; }).join('')}</tbody></table></div>`;
}
function renderMovementsModule(type){
  const rows=[]; state.clients.forEach(c=>account(c.id).money.forEach(m=>{ if(m.type===type) rows.push([c.name,'$'+m.amount.toFixed(2),m.status,m.time]); }));
  document.getElementById('adminExtra').innerHTML = `<div class="panel" style="margin-top:12px"><h3>${type}s</h3>${table(rows,['Cliente','Monto','Estado','Fecha'])}</div>`;
}
function renderOperationsModule(){
  const rows=[]; state.clients.forEach(c=>account(c.id).positions.forEach(p=>rows.push([c.name,p.symbol,p.side,p.lots,'$'+p.pnl.toFixed(2)])));
  document.getElementById('adminExtra').innerHTML = `<div class="panel" style="margin-top:12px"><h3>Operaciones abiertas</h3>${table(rows,['Cliente','Símbolo','Lado','Lotes','P&L'])}</div>`;
}
function renderAuditModule(){
  const rows=[]; state.clients.forEach(c=>c.activity.forEach(a=>rows.push([c.name,a])));
  document.getElementById('adminExtra').innerHTML = `<div class="panel" style="margin-top:12px"><h3>Auditoría</h3>${table(rows,['Cliente','Actividad'])}</div>`;
}

function renderTrade(){
  const c=client(currentUserId); const a=account(currentUserId);
  app.innerHTML = `<div class="app"><div class="top"><div><b style="color:#00d4a0">WEBTRADE</b><br><button id="logout" class="btn red">CERRAR SESIÓN</button></div><div><b style="color:#63b3ed">${c.name}</b> <button id="deposit" class="btn green">+$ DEPÓSITO</button><button id="withdraw" class="btn yellow">-$ RETIRO</button></div><div>${[['Balance',a.balance],['Equity',equity(a)],['Margin',margin(a)],['Free Margin',freeMargin(a)],['P&L',pnl(a)]].map(([m,v])=>`<span class="metric" style="display:inline-block;margin:0 10px"><small>${m}</small><b>$${v.toFixed(2)}</b></span>`).join('')}</div></div><div class="main"><div class="side" id="assetList"></div><div class="content"><div class="chartBox"><div class="chartHead"><div><b>${selectedAsset}</b><div style="color:#5a6e8a;font-size:11px">Velas japonesas simuladas · M5</div></div><div class="price">${getPrice()}</div></div><div class="chartWrap"><canvas id="chart"></canvas></div></div><div class="tabs"><button id="tabOpen" class="tab">Abiertas</button><button id="tabClosed" class="tab">Cerradas</button><button id="tabMoney" class="tab">Dinero</button></div><div id="tabContent" class="scroll"></div></div><div class="right"><div class="panel"><h3>Nueva orden</h3><button id="buy" class="btn green">BUY</button><button id="sell" class="btn red">SELL</button><br><br><input id="lots" class="input" value="0.01"><div id="orderError" class="error" style="display:none"></div><br><button id="exec" class="btn blue" style="width:100%">EJECUTAR ${selectedSide}</button></div></div></div></div>`;
  document.getElementById('logout').onclick=logout;
  document.getElementById('deposit').onclick=()=>renderMoneyForm('Depósito');
  document.getElementById('withdraw').onclick=()=>renderMoneyForm('Retiro');
  document.getElementById('buy').onclick=()=>{selectedSide='BUY';render();}; document.getElementById('sell').onclick=()=>{selectedSide='SELL';render();}; document.getElementById('exec').onclick=executeOrder;
  document.getElementById('tabOpen').onclick=()=>{activeTab='open';renderTabs();}; document.getElementById('tabClosed').onclick=()=>{activeTab='closed';renderTabs();}; document.getElementById('tabMoney').onclick=()=>{activeTab='money';renderTabs();};
  const list=document.getElementById('assetList'); assets.forEach(x=>{ const div=document.createElement('div'); div.className='item '+(x[0]===selectedAsset?'active':''); div.innerHTML=x[0]+'<br><small>'+x[1]+'</small>'; div.onclick=()=>{selectedAsset=x[0];render();}; list.appendChild(div); });
  requestAnimationFrame(()=>{ drawChart(); renderTabs(); });
}

function renderMoneyForm(type){
  app.innerHTML=`<div class="app"><div class="top"><button id="back" class="btn blue">VOLVER</button><b>${type}</b></div><div class="login"><div class="card" style="width:420px"><h3>Solicitud de ${type}</h3><input id="moneyAmount" class="input" type="number" placeholder="Monto USD"><br><br><button id="confirmMoney" class="btn green" style="width:100%;padding:12px">CONFIRMAR</button></div></div></div>`;
  document.getElementById('back').onclick=()=>setPage('trade');
  document.getElementById('confirmMoney').onclick=()=>{ const amount=Number(document.getElementById('moneyAmount').value); if(!amount||amount<=0)return; const a=account(currentUserId); a.money.unshift({type,amount,status:type==='Depósito'?'Pendiente de autorización':'Solicitud pendiente',time:now()}); if(type==='Retiro')a.balance-=amount; saveState(); activeTab='money'; setPage('trade'); };
}

function executeOrder(){
  const vol=Number(document.getElementById('lots').value); const err=document.getElementById('orderError'); const a=account(currentUserId);
  if(!vol||vol<=0){err.style.display='block';err.innerText='Volumen inválido.';return;}
  if(freeMargin(a)<vol*50){err.style.display='block';err.innerText='Saldo o margen insuficiente.';return;}
  a.positions.unshift({id:Date.now(),symbol:selectedAsset,side:selectedSide,lots:vol,pnl:0,time:now()}); a.audit.unshift('Orden '+selectedSide+' '+selectedAsset); saveState(); activeTab='open'; render();
}
function closePosition(id){ const a=account(currentUserId); const idx=a.positions.findIndex(p=>p.id===id); if(idx<0)return; const p=a.positions.splice(idx,1)[0]; a.closed.unshift({...p,time:now()}); a.balance+=p.pnl; saveState(); activeTab='closed'; render(); }
function renderTabs(){ const box=document.getElementById('tabContent'); if(!box)return; const a=account(currentUserId); document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active')); if(activeTab==='open')document.getElementById('tabOpen').classList.add('active'); if(activeTab==='closed')document.getElementById('tabClosed').classList.add('active'); if(activeTab==='money')document.getElementById('tabMoney').classList.add('active'); if(activeTab==='open')box.innerHTML=table(a.positions.map(p=>[p.symbol,p.side,p.lots,'$'+p.pnl.toFixed(2),'<button class="btn red" data-close="'+p.id+'">Cerrar</button>']),['Símbolo','Lado','Lotes','P&L','']); if(activeTab==='closed')box.innerHTML=table(a.closed.map(p=>[p.symbol,p.side,p.lots,p.time]),['Símbolo','Lado','Lotes','Hora']); if(activeTab==='money')box.innerHTML=table(a.money.map(m=>[m.type,'$'+m.amount.toFixed(2),m.status,m.time]),['Tipo','Monto','Estado','Fecha']); box.querySelectorAll('[data-close]').forEach(btn=>btn.onclick=()=>closePosition(Number(btn.dataset.close))); }
function table(rows,headers){ if(!rows.length)return'<div class="item">Sin registros</div>'; return'<table class="table"><thead><tr>'+headers.map(h=>'<th>'+h+'</th>').join('')+'</tr></thead><tbody>'+rows.map(r=>'<tr>'+r.map(c=>'<td>'+c+'</td>').join('')+'</tr>').join('')+'</tbody></table>'; }
function drawChart(){ const c=document.getElementById('chart'); if(!c)return; const rect=c.parentElement.getBoundingClientRect(); const dpr=window.devicePixelRatio||1; const W=Math.max(500,Math.floor(rect.width)); const H=Math.max(260,Math.floor(rect.height)); c.width=W*dpr;c.height=H*dpr;c.style.width=W+'px';c.style.height=H+'px'; const ctx=c.getContext('2d'); ctx.setTransform(dpr,0,0,dpr,0,0); ctx.fillStyle='#060d1a';ctx.fillRect(0,0,W,H); const left=58,right=76,top=16,bottom=34,cw=W-left-right,ch=H-top-bottom; let base=getPrice(),data=[],p=base; for(let i=0;i<70;i++){let o=p,change=(Math.random()-0.48)*base*0.004,close=o+change,high=Math.max(o,close)+Math.random()*base*0.0015,low=Math.min(o,close)-Math.random()*base*0.0015;data.push({o,close,high,low});p=close} let min=Math.min(...data.map(d=>d.low)),max=Math.max(...data.map(d=>d.high)),range=max-min||1; const y=v=>top+ch-((v-min)/range)*ch; for(let i=0;i<=6;i++){let yy=top+i*ch/6;ctx.strokeStyle='#111d30';ctx.beginPath();ctx.moveTo(left,yy);ctx.lineTo(W-right,yy);ctx.stroke();let label=max-i*range/6;ctx.fillStyle='#5a6e8a';ctx.font='11px Courier New';ctx.textAlign='right';ctx.fillText(label.toFixed(base>100?2:5),left-6,yy+4)} let step=cw/data.length; data.forEach((d,i)=>{let x=left+i*step+step/2,bull=d.close>=d.o,col=bull?'#00d4a0':'#f05e5e';ctx.strokeStyle=col;ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(x,y(d.high));ctx.lineTo(x,y(d.low));ctx.stroke();let tb=y(Math.max(d.o,d.close)),bb=y(Math.min(d.o,d.close)),h=Math.max(bb-tb,2),w=Math.max(step*.55,3);bull?ctx.strokeRect(x-w/2,tb,w,h):ctx.fillRect(x-w/2,tb,w,h)}); }
window.addEventListener('resize',()=>{ if(page==='trade')drawChart(); });
function render(){ if(page==='login')renderLogin(); else if(page==='admin')renderAdmin(); else renderTrade(); }
saveState(); render();
