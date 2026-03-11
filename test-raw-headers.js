const fetch = require('node-fetch');

async function checkHeaders() {
    const url = 'https://res.cloudinary.com/difdmidpp/raw/upload/v1773208255/arch-plan-manager/jhoy3fc8lz4wrwtmvm9f.pdf';
    const res = await fetch(url);
    console.log("Content-Type:", res.headers.get('content-type'));
    console.log("Content-Disposition:", res.headers.get('content-disposition'));
}
checkHeaders();
