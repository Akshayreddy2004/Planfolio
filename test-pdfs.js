require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

async function testFetchAll() {
    try {
        console.log("Checking resources...");
        // List recent uploads to see what URL it generated
        const result = await cloudinary.search.expression('folder:arch-plan-manager').sort_by('created_at', 'desc').max_results(5).execute();
        
        result.resources.forEach(r => {
            console.log(`Type: ${r.resource_type}, Format: ${r.format}, URL: ${r.secure_url}`);
        });
        
    } catch(e) {
        console.error(e);
    }
}

testFetchAll();
