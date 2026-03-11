const fetch = require('node-fetch');

async function testFetchRaw() {
    const url = 'https://res.cloudinary.com/difdmidpp/raw/upload/v1773208255/arch-plan-manager/jhoy3fc8lz4wrwtmvm9f';
    const res = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    });

    console.log("Status:", res.status);
    console.log("Content-Type:", res.headers.get('content-type'));
    if (res.ok) {
        console.log("SUCCESS FETCHING RAW NATIVELY");
    }
}
testFetchRaw();
