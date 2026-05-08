const LIVE_TICK_MS = 1000;
let liveTickCounter = 0;
let livePrices = {};
let liveCandles = {};

function initLiveChartData() {
  assets.forEach((asset) => {
    const symbol = asset[0];
    const base = Number(asset[1]);
    if (!livePrices[symbol]) livePrices[symbol] = base;
    if (!liveCandles[symbol]) liveCandles[symbol] = seedCandles(base);
  });
}

function seedCandles(base) {
  const candles = [];
  let price = base;
  for (let i = 0; i < 70; i++) {
    const open = price;
    const close = open + (Math.random() - 0.5) * base * 0.003;
    const high = Math.max(open, close) + Math.random() * base * 0.0012;
    const low = Math.min(open, close) - Math.random() * base * 0.0012;
    candles.push({ open, high, low, close });
    price = close;
  }
  return candles;
}

getPrice = function () {
  initLiveChartData();
  return livePrices[selectedAsset] || (assets.find((a) => a[0] === selectedAsset) || assets[0])[1];
};

function tickLivePrices() {
  initLiveChartData();
  liveTickCounter++;

  assets.forEach((asset) => {
    const symbol = asset[0];
    const current = livePrices[symbol] || Number(asset[1]);
    const volatility = current > 1000 ? 0.0007 : current > 100 ? 0.00035 : 0.00012;
    const next = Math.max(0.00001, current + (Math.random() - 0.5) * current * volatility);
    livePrices[symbol] = next;

    const candles = liveCandles[symbol] || seedCandles(next);
    let last = candles[candles.length - 1];

    if (liveTickCounter % 5 === 0) {
      candles.push({ open: last.close, high: next, low: next, close: next });
      if (candles.length > 90) candles.shift();
    } else {
      last.close = next;
      last.high = Math.max(last.high, next);
      last.low = Math.min(last.low, next);
    }

    liveCandles[symbol] = candles;
  });

  if (page === 'trade') {
    updateLivePriceLabel();
    drawChart();
  }
}

function updateLivePriceLabel() {
  const priceNode = document.querySelector('.price');
  if (!priceNode) return;
  const price = getPrice();
  priceNode.textContent = price > 100 ? price.toFixed(2) : price.toFixed(5);
}

drawChart = function () {
  const canvas = document.getElementById('chart');
  if (!canvas) return;

  initLiveChartData();

  const wrap = canvas.parentElement;
  const rect = wrap.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const W = Math.max(500, Math.floor(rect.width));
  const H = Math.max(260, Math.floor(rect.height));

  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';

  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#060d1a';
  ctx.fillRect(0, 0, W, H);

  const candles = liveCandles[selectedAsset] || seedCandles(getPrice());
  const visible = candles.slice(-70);
  const left = 58;
  const right = 84;
  const top = 16;
  const bottom = 34;
  const CW = W - left - right;
  const CH = H - top - bottom;

  const min = Math.min(...visible.map((c) => c.low));
  const max = Math.max(...visible.map((c) => c.high));
  const range = max - min || 1;
  const y = (value) => top + CH - ((value - min) / range) * CH;

  for (let i = 0; i <= 6; i++) {
    const yy = top + (i * CH) / 6;
    ctx.strokeStyle = '#111d30';
    ctx.beginPath();
    ctx.moveTo(left, yy);
    ctx.lineTo(W - right, yy);
    ctx.stroke();

    const label = max - (i * range) / 6;
    ctx.fillStyle = '#5a6e8a';
    ctx.font = '11px Courier New';
    ctx.textAlign = 'right';
    ctx.fillText(label > 100 ? label.toFixed(2) : label.toFixed(5), left - 6, yy + 4);
  }

  const step = CW / visible.length;
  visible.forEach((candle, i) => {
    const x = left + i * step + step / 2;
    const bull = candle.close >= candle.open;
    const color = bull ? '#00d4a0' : '#f05e5e';
    ctx.strokeStyle = color;
    ctx.fillStyle = color;

    ctx.beginPath();
    ctx.moveTo(x, y(candle.high));
    ctx.lineTo(x, y(candle.low));
    ctx.stroke();

    const bodyTop = y(Math.max(candle.open, candle.close));
    const bodyBottom = y(Math.min(candle.open, candle.close));
    const bodyHeight = Math.max(bodyBottom - bodyTop, 2);
    const bodyWidth = Math.max(step * 0.55, 3);

    if (bull) ctx.strokeRect(x - bodyWidth / 2, bodyTop, bodyWidth, bodyHeight);
    else ctx.fillRect(x - bodyWidth / 2, bodyTop, bodyWidth, bodyHeight);
  });

  const currentPrice = getPrice();
  const priceY = y(currentPrice);

  ctx.setLineDash([5, 5]);
  ctx.strokeStyle = '#63b3ed';
  ctx.beginPath();
  ctx.moveTo(left, priceY);
  ctx.lineTo(W - right, priceY);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#63b3ed';
  ctx.fillRect(W - right + 4, priceY - 11, right - 8, 22);
  ctx.fillStyle = '#060d1a';
  ctx.font = 'bold 11px Courier New';
  ctx.textAlign = 'center';
  ctx.fillText(currentPrice > 100 ? currentPrice.toFixed(2) : currentPrice.toFixed(5), W - right / 2 + 3, priceY + 4);
};

initLiveChartData();
setInterval(tickLivePrices, LIVE_TICK_MS);
