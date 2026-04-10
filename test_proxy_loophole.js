const shopId = '426143063';
const itemId = '25415033275';
const proxyUrl = `https://shopee-co-th.translate.goog/product/${shopId}/${itemId}?_x_tr_sl=auto&_x_tr_tl=en&_x_tr_hl=en-US&_x_tr_pto=wapp`;

async function test() {
  console.log('📡 Testing Google Translate Loophole...');
  console.log('🔗 Proxy URL: ' + proxyUrl);
  
  try {
    const res = await fetch(proxyUrl, { 
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36' } 
    });
    
    if (!res.ok) {
        console.error(`❌ Proxy returned error: ${res.status}`);
        return;
    }

    const html = await res.text();
    
    // Extract using regex for speed
    const imageMatch = html.match(/property="og:image" content="([^"]+)"/);
    const titleMatch = html.match(/property="og:title" content="([^"]+)"/);
    
    console.log('------------------------------------------');
    console.log('📸 Image Found: ' + (imageMatch ? imageMatch[1] : 'NOT FOUND'));
    console.log('🏷️ Title Found: ' + (titleMatch ? titleMatch[1] : 'NOT FOUND'));
    console.log('------------------------------------------');
    
    if (imageMatch && imageMatch[1].includes('susercontent')) {
        console.log('✅ LOOPHOLE IS WORKING! We can extract Shopee CDN images via Google Proxy.');
    } else {
        console.log('⚠️ Image found but might not be the direct Shopee CDN one.');
    }

  } catch (e) {
    console.log('❌ Script Error: ' + e.message);
  }
}

test();
