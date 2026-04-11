
const cheerio = require('cheerio');

async function debugPrice() {
  const shopId = '1432737694'; // FANTECH
  const itemId = '27079286226'; // MP903
  const proxyUrl = `https://shopee-co-th.translate.goog/product/${shopId}/${itemId}?_x_tr_sl=auto&_x_tr_tl=en&_x_tr_hl=en-US&_x_tr_pto=wapp`;
  
  console.log(`📡 Fetching: ${proxyUrl}`);
  
  try {
    const res = await fetch(proxyUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await res.text();
    const $ = cheerio.load(html);
    
    const jsonStringMatch = html.match(/<script [^>]*type="text\/mfe-initial-data"[^>]*>(.*?)<\/script>/s);
    if (jsonStringMatch) {
        const fullState = JSON.parse(jsonStringMatch[1]);
        const itemData = fullState?.initialState?.DOMAIN_PDP?.data?.PDP_BFF_DATA?.cachedMap[`${shopId}/${itemId}`]?.item 
                       || fullState?.initialState?.item;
        
        console.log('--- Price Info ---');
        console.log('price_min:', itemData?.price_min);
        console.log('price:', itemData?.price);
        console.log('price_max:', itemData?.price_max);
        console.log('models[0] price:', itemData?.models?.[0]?.price);
    }
  } catch (e) {
    console.log(`❌ Error: ${e.message}`);
  }
}

debugPrice();
