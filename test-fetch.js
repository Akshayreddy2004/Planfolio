const fetch = require('node-fetch');
const http = require('http');

async function testFetch() {
    try {
        const url = 'https://res.cloudinary.com/difdmidpp/image/upload/v1773160503/arch-plan-manager/kfg7puirfniqkqvvwb7a.pdf';
        console.log(`Fetching from: ${url}`);
        const response = await fetch(url);
        console.log(`Status: ${response.status} ${response.statusText}`);
        console.log(`Content-Type: ${response.headers.get('content-type')}`);
        
        if (!response.ok) {
            console.error("Fetch failed");
            return;
        }
        
        console.log("Fetch succeeded.");
    } catch (e) {
        console.error("Error during fetch:", e);
    }
}

testFetch();
