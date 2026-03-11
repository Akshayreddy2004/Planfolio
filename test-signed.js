require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const fetch = require('node-fetch');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

async function testSigned() {
    const publicId = "arch-plan-manager/kfg7puirfniqkqvvwb7a";
    
    // Generate signed URL
    const signedUrl = cloudinary.url(publicId, {
        sign_url: true,
        resource_type: 'image',
        format: 'pdf',
        secure: true
    });
    
    console.log("Signed URL:", signedUrl);
    
    const res = await fetch(signedUrl);
    console.log("Status:", res.status, res.statusText);
    if (res.ok) {
        console.log("Success! Headers:", res.headers.raw());
    }
}
testSigned();
