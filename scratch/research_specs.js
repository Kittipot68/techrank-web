
const cheerio = require('cheerio');

async function testSpecsExtraction() {
  const shopId = '426143063';
  const itemId = '25415033275';
  const proxyUrl = `https://shopee-co-th.translate.goog/product/${shopId}/${itemId}?_x_tr_sl=auto&_x_tr_tl=en&_x_tr_hl=en-US&_x_tr_pto=wapp`;
  
  console.log(`📡 Fetching: ${proxyUrl}`);
  
  try {
    const res = await fetch(proxyUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await res.text();
    const $ = cheerio.load(html);
    
    console.log('--- Metadata ---');
    console.log('Title:', $('title').text());
    console.log('OG Image:', $('meta[property="og:image"]').attr('content'));
    
    console.log('\n--- Searching for Specs Table ---');
    // Try to find the section with specs. Usually they are in a list or table.
    // Via proxy, Shopee might render some parts differently or they might be in the SSR script.
    
    const specs = [];
    // Shopee specs often look like: Label: Value
    // We can look for common spec patterns or the specific container
    
    const dataScript = $('script[type="text/mfe-initial-data"]').html();
    if (dataScript) {
        console.log('✅ Found mfe-initial-data script!');
        try {
            const data = JSON.parse(dataScript);
            // In translate.goog version, the structure might be different or partially modified
            console.log('JSON Data available. Sample keys:', Object.keys(data).slice(0, 5));
        } catch(e) {
            console.log('❌ JSON Parse failed');
        }
    } else {
        console.log('❌ mfe-initial-data NOT found via proxy');
    }

    // Fallback: Parse HTML for any "Label: Value" pairs in the product description section
    console.log('\n--- HTML Snippet (Look for labels) ---');
    const bodyText = $('body').text();
    if (bodyText.includes('Brand:')) console.log('Found "Brand:"');
    if (bodyText.includes('Model:')) console.log('Found "Model:"');
    
  } catch (e) {
    console.log(`❌ Error: ${e.message}`);
  }
}

testSpecsExtraction();
