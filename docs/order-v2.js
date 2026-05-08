function assetTypeForOrder(symbol){
  if(symbol.startsWith('XAU') || symbol.startsWith('XAG')) return 'Metales';
  if(symbol.startsWith('BTC') || symbol.startsWith('ETH')) return 'Cripto';
  if(symbol.startsWith('US') || symbol.startsWith('NAS')) return 'Índice';
  if(symbol.includes('/')) return 'Forex';
  return 'Acción';
}

function contractSizeForOrder(symbol){
  const type = assetTypeForOrder(symbol);
  if(type === 'Forex') return 100000;
  if(type === 'Metales') return 100;
  if(type === 'Cripto') return 1;
  if(type === 'Índice') return 1;
  return 100;
}

function calcOrderTicket(lots){
  const volume = Number(lots) || 0;
  const units = volume * contractSizeForOrder(selectedAsset);
  const requiredMargin = volume * 50;
  const after = freeMargin(account(currentUserId)) - requiredMargin;
  return { volume, units, requiredMargin, after };
}

function updateAdvancedOrderInfo(){
  const lotsEl = document.getElementById('lots');
  const box = document.getElementById('orderInfo');
  if(!lotsEl || !box) return;
  const orderType = document.getElementById('orderType').value;
  const trigger = document.getElementById('triggerPrice').value;
  const sl = document.getElementById('sl').value;
  const tp = document.getElementById('tp').value;
  const calc = calcOrderTicket(lotsEl.value);
  const typeText = orderType === 'market' ? 'Mercado inmediato' : 'Pendiente al precio ' + (trigger || 'sin definir');
  box.innerHTML = '<b>Resumen de movimiento</b><br>' +
    'Activo: ' + selectedAsset + '<br>' +
    'Lado: ' + selectedSide + '<br>' +
    'Tipo: ' + typeText + '<br>' +
    'Lotes: ' + calc.volume + '<br>' +
    'Unidades aprox: ' + calc.units.toLocaleString('es-MX') + '<br>' +
    'Valor actual: ' + getPrice() + '<br>' +
    'Margen requerido: $' + calc.requiredMargin.toFixed(2) + '<br>' +
    'Margen libre después: $' + calc.after.toFixed(2) + '<br>' +
    'SL: ' + (sl || 'Sin SL') + ' · TP: ' + (tp || 'Sin TP');
}

renderTrade = function(){
  const c = client(currentUserId);
  const a = account(currentUserId);
  app.innerHTML = `<div class="app"><div class="top"><div><b style="color:#00d4a0">WEBTRADE</b><br><button id="logout" class="btn red">CERRAR SESIÓN</button></div><div><b style="color:#63b3ed">${c.name}</b> <button id="deposit" class="btn green">+$ DEPÓSITO</button><button id="withdraw" class="btn yellow">-$ RETIRO</button></div><div>${[['Balance',a.balance],['Equity',equity(a)],['Margin',margin(a)],['Free Margin',freeMargin(a)],['P&L',pnl(a)]].map(([m,v])=>`<span class="metric" style="display:inline-block;margin:0 10px"><small>${m}</small><b>$${v.toFixed(2)}</b></span>`).join('')}</div></div><div class="main"><div class="side" id="assetList"></div><div class="content"><div class="chartBox"><div class="chartHead"><div><b>${selectedAsset}</b><div style="color:#5a6e8a;font-size:11px">Velas japonesas simuladas · M5</div></div><div class="price">${getPrice()}</div></div><div class="chartWrap"><canvas id="chart"></canvas></div></div><div class="tabs"><button id="tabOpen" class="tab">Abiertas</button><button id="tabClosed" class="tab">Cerradas</button><button id="tabMoney" class="tab">Dinero</button></div><div id="tabContent" class="scroll"></div></div><div class="right"><div class="panel"><h3>Nueva orden</h3><button id="buy" class="btn green">BUY</button><button id="sell" class="btn red">SELL</button><br><br><label>Tipo de orden</label><select id="orderType" class="input"><option value="market">Mercado</option><option value="pending">Pendiente por precio</option></select><br><br><label>Precio pendiente</label><input id="triggerPrice" class="input" placeholder="Ej. ${getPrice()}"><br><br><label>Lotes</label><input id="lots" class="input" value="0.01"><br><br><label>Stop Loss</label><input id="sl" class="input" placeholder="Opcional"><br><br><label>Take Profit</label><input id="tp" class="input" placeholder="Opcional"><div id="orderInfo" class="warn"></div><div id="orderError" class="error" style="display:none"></div><br><button id="exec" class="btn blue" style="width:100%">CONFIRMAR ${selectedSide}</button></div></div></div></div>`;

  document.getElementById('logout').onclick = logout;
  document.getElementById('deposit').onclick = () => renderMoneyForm('Depósito');
  document.getElementById('withdraw').onclick = () => renderMoneyForm('Retiro');
  document.getElementById('buy').onclick = () => { selectedSide = 'BUY'; render(); };
  document.getElementById('sell').onclick = () => { selectedSide = 'SELL'; render(); };
  document.getElementById('exec').onclick = executeOrder;
  document.getElementById('orderType').onchange = updateAdvancedOrderInfo;
  document.getElementById('triggerPrice').oninput = updateAdvancedOrderInfo;
  document.getElementById('lots').oninput = updateAdvancedOrderInfo;
  document.getElementById('sl').oninput = updateAdvancedOrderInfo;
  document.getElementById('tp').oninput = updateAdvancedOrderInfo;
  document.getElementById('tabOpen').onclick = () => { activeTab='open'; renderTabs(); };
  document.getElementById('tabClosed').onclick = () => { activeTab='closed'; renderTabs(); };
  document.getElementById('tabMoney').onclick = () => { activeTab='money'; renderTabs(); };

  const list = document.getElementById('assetList');
  assets.forEach(x => {
    const div = document.createElement('div');
    div.className = 'item ' + (x[0] === selectedAsset ? 'active' : '');
    div.innerHTML = x[0] + '<br><small>' + x[1] + '</small>';
    div.onclick = () => { selectedAsset = x[0]; render(); };
    list.appendChild(div);
  });
  requestAnimationFrame(() => { drawChart(); renderTabs(); updateAdvancedOrderInfo(); });
};

executeOrder = function(){
  const lotsEl = document.getElementById('lots');
  const err = document.getElementById('orderError');
  const a = account(currentUserId);
  const volume = Number(lotsEl.value);
  const type = document.getElementById('orderType').value;
  const trigger = Number(document.getElementById('triggerPrice').value);
  const sl = Number(document.getElementById('sl').value);
  const tp = Number(document.getElementById('tp').value);
  const calc = calcOrderTicket(volume);
  if(!volume || volume <= 0){ err.style.display='block'; err.innerText='Volumen inválido.'; return; }
  if(type === 'pending' && (!trigger || trigger <= 0)){ err.style.display='block'; err.innerText='Coloca un precio pendiente válido.'; return; }
  if(freeMargin(a) < calc.requiredMargin){ err.style.display='block'; err.innerText='Saldo o margen insuficiente.'; return; }
  a.positions.unshift({
    id: Date.now(), symbol: selectedAsset, side: selectedSide, lots: volume,
    units: calc.units, marginUsed: calc.requiredMargin,
    orderType: type === 'market' ? 'Mercado' : 'Pendiente',
    triggerPrice: type === 'pending' ? trigger : getPrice(),
    sl: sl || null, tp: tp || null,
    status: type === 'market' ? 'Abierta' : 'Pendiente',
    open: type === 'pending' ? trigger : getPrice(), pnl: 0, time: now()
  });
  a.audit.unshift('Orden ' + selectedSide + ' ' + selectedAsset + ' ' + (type === 'market' ? 'mercado' : 'pendiente'));
  saveState(); activeTab='open'; render();
};

renderTabs = function(){
  const box = document.getElementById('tabContent'); if(!box) return;
  const a = account(currentUserId);
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  if(activeTab==='open') document.getElementById('tabOpen').classList.add('active');
  if(activeTab==='closed') document.getElementById('tabClosed').classList.add('active');
  if(activeTab==='money') document.getElementById('tabMoney').classList.add('active');
  if(activeTab==='open') box.innerHTML = table(a.positions.map(p=>[p.symbol,p.side,p.lots,p.status||'Abierta',p.orderType||'Mercado','$'+(p.marginUsed||p.lots*50).toFixed(2),p.units?Number(p.units).toLocaleString('es-MX'):'—',p.sl||'—',p.tp||'—','<button class="btn red" data-close="'+p.id+'">Cerrar</button>']),['Símbolo','Lado','Lotes','Estado','Tipo','Margen','Unidades','SL','TP','']);
  if(activeTab==='closed') box.innerHTML = table(a.closed.map(p=>[p.symbol,p.side,p.lots,p.status,p.time]),['Símbolo','Lado','Lotes','Estado','Hora']);
  if(activeTab==='money') box.innerHTML = table(a.money.map(m=>[m.type,'$'+m.amount.toFixed(2),m.status,m.time]),['Tipo','Monto','Estado','Fecha']);
  box.querySelectorAll('[data-close]').forEach(btn=>btn.onclick=()=>closePosition(Number(btn.dataset.close)));
};

if(page === 'trade') render();
