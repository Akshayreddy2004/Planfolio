require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const fetch = require('node-fetch');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

async function testFullFlow() {
    try {
        console.log("1. Simulating an upload with server.js settings...");
        const result = await cloudinary.uploader.upload(
            'data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3RoIDMgMCBSL0ZpbHRlci9GbGF0ZURlY29kZT4+CnN0cmVhbQp4nDPQM1Qo5ypUMFAwALJMLYyM1AtylXzy0xVCM1MVEvPSSxWKUvPz1FwSCzLzUlLLFEpyS1JzjZUqFQwNqgEAPzkQDwplbmRzdHJlYW0KZW5kb2JqCgozIDAgb2JqCjg1CmVuZG9iagoKMSAwIG9iago8PC9UeXBlL1BhZ2UvTWVkaWFCb3hbMCAwIDU5NS4yNzYgODQxLjg5M10vUGFyZW50IDQgMCBSL1Jlc291cmNlczw8L0ZvbnQ8PC9GMTEgNSAwIFI+MTYwIDAgUj4+L0NvbnRlbnRzIDIgMCBSPj4KZW5kb2JqCgo0IDAgb2JqCjw8L1R5cGUvUGFnZXMvS2lkc1sxIDAgUl0vQ291bnQgMT4+CmVuZG9iagoKNCAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgNCAwIFI+PgplbmRvYmoKCjYgMCBvYmoKPDwvVHlwZS9Gb250RGVzY3JpcHRvci9Gb250TmFtZS9UaW1lcy1Sb21hbi9GbGFncyAzNC9Gb250QkJveFstMjUwIC0yMTYgMTE1MCAxMDAwXS9JdGFsaWNBbmdsZSAwL0FzY2VudCA4OTAvRGVzY2VudCAtMjE2L0NhcEhlaWdodCA2NzkvU3RlbVYgODAvWUhlaWdodCAxNzE+PgplbmRvYmoKCjUgMCBvYmoKPDwvVHlwZS9Gb250L1N1YnR5cGUvVHlwZTEvQmFzZUZvbnQvVGltZXMtUm9tYW4vRm9udERlc2NyaXB0b3IgNiAwIFI+PgplbmRvYmoKCnhyZWYKMCA3CjAwMDAwMDAwMDAgNjUzNTUgZgoyMDAyMDAwMDI1IDAwMDAwIG4KMDAwMDAwMDE2MyAwMDAwMCBuCjAwMDAwMDAyNjUgMDAwMDAgbgoyMDAyMDAwMzY4IDAwMDAwIG4KMDAwMDAwMDQxNiAwMDAwMCBuCjAwMDAwMDA1MjUgMDAwMDAgbgp0cmFpbGVyCjw8L1NpemUgNy9Sb290IDQgMCBSPj4Kc3RhcnR4cmVmCjYzNwolJUVPRgo=',
            { resource_type: 'raw', folder: 'arch-plan-manager', format: 'pdf' }
        );
        console.log("   Uploaded URL:", result.secure_url);
        
        console.log("\n2. Simulating backend proxy fetch...");
        const targetUrl = result.secure_url;
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        });
        
        console.log("   Fetch Status:", response.status);
        if (!response.ok) {
            console.error(`   Failed to fetch! ${response.statusText}`);
            console.log("   Headers:", response.headers.raw());
            console.log("   Body:", await response.text());
        } else {
            console.log("   Fetch successful!");
            console.log("   Headers:", response.headers.raw());
        }
    } catch(e) {
        console.error("Test failed:", e);
    }
}
testFullFlow();
