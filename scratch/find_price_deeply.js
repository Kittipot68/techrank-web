
const cheerio = require('cheerio');

async function findPriceDeeply() {
  const shopId = '1432737694'; 
  const itemId = '27079286226'; 
  const proxyUrl = `https://shopee-co-th.translate.goog/product/${shopId}/${itemId}?_x_tr_sl=auto&_x_tr_tl=en&_x_tr_hl=en-US&_x_tr_pto=wapp`;
  
  try {
    const res = await fetch(proxyUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await res.text();
    const $ = cheerio.load(html);
    
    const jsonStringMatch = html.match(/<script [^>]*type="text\/mfe-initial-data"[^>]*>(.*?)<\/script>/s);
    if (jsonStringMatch) {
        const fullState = JSON.parse(jsonStringMatch[1]);
        
        // Exhaustive search for something that looks like a price (e.g., 1000000 or similar)
        // For a mousepad it might be 390000 (390 THB)
        
        const jsonStr = JSON.stringify(fullState);
        console.log('JSON Length:', jsonStr.length);
        
        // Look for "price" key occurrences
        const matches = [];
        const regex = /"price":(\d+)/g;
        let match;
        while ((match = regex.exec(jsonStr)) !== null) {
            matches.push(match[1]);
        }
        console.log('Found price values:', matches);

        // Look for "price_min" key occurrences
        const matchesMin = [];
        const regexMin = /"price_min":(\d+)/g;
        let matchMin;
        while ((matchMin = regexMin.exec(jsonStr)) !== null) {
            matchesMin.push(matchMin[1]);
        }
        console.log('Found price_min values:', matchesMin);

    }
  } catch (e) {
    console.log(`❌ Error: ${e.message}`);
  }
}

findPriceDeeply();
