
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testDirect() {
  const url = 'https://shopee.co.th/product/426143063/25415033275';
  console.log(`📡 Testing Direct Fetch to ${url}...`);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'th-TH,th;q=0.9,en-US;q=0.8,en;q=0.7',
      }
    });
    console.log(`HTTP Status: ${res.status}`);
    const html = await res.text();
    console.log(`HTML Length: ${html.length}`);
    if (html.includes('mfe-initial-data')) {
      console.log('✅ Found data script!');
    } else {
      console.log('❌ Data script NOT found. Likely blocked or structure changed.');
      if (html.includes('captcha') || html.includes('robot')) {
        console.log('🚨 DETECTED CAPTCHA/ROBOT BLOCK!');
      }
    }
  } catch (e) {
    console.log(`❌ Error: ${e.message}`);
  }
}

testDirect();
