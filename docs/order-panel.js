function contractSize(symbol){
  if(symbol.includes('/USD') || symbol.includes('USD/') || symbol.includes('/JPY')) return 100000;
  if(symbol.includes('XAU')) return 100;
  if(symbol.includes('XAG')) return 5000;
  return 1;
}
function orderUnits(lots){return Number(lots||0)*contractSize(selectedAsset)}
function orderNotional(lots, price){return orderUnits(lots)*Number(price||getPrice())}
function orderMargin(lots, price){return orderNotional(lots, price)/2000}
function orderDigits(){return getPrice()>100 ? 2 : 5}

function renderTrade(){
  const c=client(currentUserId),a=account(currentUserId);
  app.innerHTML=`<div class="app"><div class="top"><div><b style="color:#00d4a0">WEBTRADE</b><br><button id="logout" class="btn red">CERRAR SESIÓN</button></div><div><b style="color:#63b3ed">${c.name}</b> <button id="deposit" class="btn green">+$ DEPÓSITO</button><button id="withdraw" class="btn yellow">-$ RETIRO</button></div><div>${[['Balance',a.balance],['Equity',equity(a)],['Margin',margin(a)],['Free Margin',freeMargin(a)],['P&L',pnl(a)]].map(([m,v])=>`<span class="metric" style="display:inline-block;margin:0 10px"><small>${m}</small><b>$${v.toFixed(2)}</b></span>`).join('')}</div></div><div class="main"><div class="side" id="assetList"></div><div class="content"><div class="chartBox"><div class="chartHead"><div><b>${selectedAsset}</b><div style="color:#5a6e8a;font-size:11px">Velas japonesas simuladas · M5</div></div><div class="price">${getPrice()}</div></div><div class="chartWrap"><canvas id="chart"></canvas></div></div><div class="tabs"><button id="tabOpen" class="tab">Abiertas</button><button id="tabClosed" class="tab">Cerradas</button><button id="tabMoney" class="tab">Dinero</button></div><div id="tabContent" class="scroll"></div></div><div class="right"><div class="panel"><h3>Nueva orden</h3><div style="display:flex;gap:6px"><button id="buy" class="btn green" style="flex:1">BUY</button><button id="sell" class="btn red" style="flex:1">SELL</button></div><br><label>Tipo de orden</label><select id="orderType" class="input"><option value="market">Tiempo de mercado</option><option value="pending">Cuando llegue a precio</option></select><br><br><label>Precio de entrada</label><input id="entryPrice" class="input" type="number" step="0.00001" value="${getPrice()}"><br><br><label>Volumen / lotes</label><input id="lots" class="input" type="number" step="0.01" min="0.01" value="0.01"><br><br><label>Stop Loss</label><input id="sl" class="input" type="number" step="0.00001" placeholder="Opcional"><br><br><label>Take Profit</label><input id="tp" class="input" type="number" step="0.00001" placeholder="Opcional"><div id="orderInfo" class="warn"></div><div id="orderError" class="error" style="display:none"></div><button id="exec" class="btn blue" style="width:100%;padding:10px">CONFIRMAR ${selectedSide}</button></div></div></div></div>`;
  document.getElementById('logout').onclick=logout;
  document.getElementById('deposit').onclick=()=>renderMoneyForm('Depósito');
  document.getElementById('withdraw').onclick=()=>renderMoneyForm('Retiro');
  document.getElementById('buy').onclick=()=>{selectedSide='BUY';render()};
  document.getElementById('sell').onclick=()=>{selectedSide='SELL';render()};
  ['orderType','entryPrice','lots','sl','tp'].forEach(id=>document.getElementById(id).oninput=updateOrderInfo);
  document.getElementById('exec').onclick=executeOrder;
  document.getElementById('tabOpen').onclick=()=>{activeTab='open';renderTabs()};
  document.getElementById('tabClosed').onclick=()=>{activeTab='closed';renderTabs()};
  document.getElementById('tabMoney').onclick=()=>{activeTab='money';renderTabs()};
  const list=document.getElementById('assetList');
  assets.forEach(x=>{const div=document.createElement('div');div.className='item '+(x[0]===selectedAsset?'active':'');div.innerHTML=x[0]+'<br><small>'+x[1]+'</small>';div.onclick=()=>{selectedAsset=x[0];render()};list.appendChild(div)});
  updateOrderInfo();
  requestAnimationFrame(()=>{drawChart();renderTabs()});
}

function updateOrderInfo(){
  const lots=Number(document.getElementById('lots')?.value||0);
  const type=document.getElementById('orderType')?.value||'market';
  const price=type==='market'?getPrice():Number(document.getElementById('entryPrice')?.value||getPrice());
  const sl=document.getElementById('sl')?.value||'—';
  const tp=document.getElementById('tp')?.value||'—';
  const u=orderUnits(lots),n=orderNotional(lots,price),m=orderMargin(lots,price);
  const box=document.getElementById('orderInfo');
  if(!box)return;
  box.innerHTML=`Tipo: ${type==='market'?'Tiempo de mercado':'Pendiente por precio'}<br>Activo: ${selectedAsset}<br>Lado: ${selectedSide}<br>Lotes: ${lots||0}<br>Unidades aprox: ${u.toLocaleString()}<br>Precio entrada: ${Number(price||0).toFixed(orderDigits())}<br>SL: ${sl} · TP: ${tp}<br>Margen usado 1:2000: $${m.toFixed(2)}<br>Valor nocional aprox: $${n.toFixed(2)}`;
}

function executeOrder(){
  const err=document.getElementById('orderError'),a=account(currentUserId);
  const lots=Number(document.getElementById('lots').value);
  const type=document.getElementById('orderType').value;
  const entry=type==='market'?getPrice():Number(document.getElementById('entryPrice').value||getPrice());
  const sl=document.getElementById('sl').value;
  const tp=document.getElementById('tp').value;
  const used=orderMargin(lots,entry);
  if(!lots||lots<=0){err.style.display='block';err.innerText='Volumen inválido.';return}
  if(freeMargin(a)<used){err.style.display='block';err.innerText='Saldo o margen insuficiente.';return}
  const pos={id:Date.now(),symbol:selectedAsset,side:selectedSide,lots,units:orderUnits(lots),orderType:type==='market'?'Mercado':'Pendiente',status:type==='market'?'Abierta':'Pendiente',open:entry,entryPrice:entry,sl:sl||null,tp:tp||null,margin:used,notional:orderNotional(lots,entry),pnl:0,time:now()};
  a.positions.unshift(pos);
  a.audit.unshift('Orden '+pos.orderType+' '+selectedSide+' '+selectedAsset);
  saveState();activeTab='open';render();
}

function renderTabs(){
  const box=document.getElementById('tabContent'); if(!box)return;
  const a=account(currentUserId);
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  if(activeTab==='open')document.getElementById('tabOpen').classList.add('active');
  if(activeTab==='closed')document.getElementById('tabClosed').classList.add('active');
  if(activeTab==='money')document.getElementById('tabMoney').classList.add('active');
  if(activeTab==='open')box.innerHTML=table(a.positions.map(p=>[p.symbol,p.side,p.lots,p.orderType||'Mercado',p.status||'Abierta',p.open,p.sl||'—',p.tp||'—','$'+(p.margin||0).toFixed(2),p.units||'—','<button class="btn red" data-close="'+p.id+'">Cerrar</button>']),['Símbolo','Lado','Lotes','Tipo','Estado','Entrada','SL','TP','Margen','Unidades','']);
  if(activeTab==='closed')box.innerHTML=table(a.closed.map(p=>[p.symbol,p.side,p.lots,p.open,p.sl||'—',p.tp||'—',p.time]),['Símbolo','Lado','Lotes','Entrada','SL','TP','Hora']);
  if(activeTab==='money')box.innerHTML=table(a.money.map(m=>[m.type,'$'+m.amount.toFixed(2),m.status,m.time]),['Tipo','Monto','Estado','Fecha']);
  box.querySelectorAll('[data-close]').forEach(btn=>btn.onclick=()=>closePosition(Number(btn.dataset.close)));
}

setTimeout(()=>{if(page==='trade')render()},0);
