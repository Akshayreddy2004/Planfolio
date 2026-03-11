require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const fetch = require('node-fetch');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

async function testApi() {
    const publicId = "arch-plan-manager/kfg7puirfniqkqvvwb7a";
    
    try {
        console.log("Generating private download URL...");
        // Generate private download url
        const url = cloudinary.utils.private_download_url(publicId, 'pdf', {
            attachment: false,
            resource_type: 'image'
        });
        
        console.log("URL:", url);
        
        const res = await fetch(url);
        console.log("Status:", res.status, res.statusText);
        if (res.ok) {
            console.log("Success fetching private download URL!");
        } else {
            console.log(await res.text());
        }
    } catch (e) {
        console.error(e);
    }
}
testApi();
