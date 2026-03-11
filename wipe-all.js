require('dotenv').config();
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const Plan = require('./models/Plan');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

async function wipeEverything() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected.");

        // 1. Wipe Cloudinary Folder
        console.log("Wiping Cloudinary folder 'arch-plan-manager'...");
        try {
            // Delete all resources in the folder (default is image)
            const resultImg = await cloudinary.api.delete_resources_by_prefix('arch-plan-manager/', { resource_type: 'image' });
            console.log("Deleted Cloudinary image resources:", resultImg);
            
            // Delete raw resources as well
            const resultRaw = await cloudinary.api.delete_resources_by_prefix('arch-plan-manager/', { resource_type: 'raw' });
            console.log("Deleted Cloudinary raw resources:", resultRaw);
        } catch (cloudErr) {
            console.error("Cloudinary wipe error:", cloudErr.message || cloudErr);
        }

        // 2. Wipe MongoDB Collection
        console.log("Wiping MongoDB Plans Collection...");
        const deleteCount = await Plan.deleteMany({});
        console.log(`Deleted ${deleteCount.deletedCount} plans from MongoDB.`);

        console.log("WIPE COMPLETE.");
        process.exit(0);

    } catch (err) {
        console.error("Fatal Error:", err);
        process.exit(1);
    }
}

wipeEverything();
