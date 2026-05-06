export const INSTRUMENTS = [
  ['EUR/USD','Forex',1.0854],
  ['GBP/USD','Forex',1.2687],
  ['USD/JPY','Forex',151.34],
  ['USD/CHF','Forex',0.8913],
  ['AUD/USD','Forex',0.6621],
  ['XAU/USD','Metals',3042.15],
  ['XAG/USD','Metals',27.55],
  ['BTC/USD','Crypto',84210],
  ['ETH/USD','Crypto',3120],
  ['US30','Indices',38200],
  ['US500','Indices',5200],
  ['NAS100','Indices',18200],
  ['AAPL','Stocks',185],
  ['TSLA','Stocks',210],
  ['NVDA','Stocks',950]
].map(([symbol, market, price]) => ({ symbol, market, price }));
