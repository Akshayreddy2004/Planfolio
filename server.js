require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const Plan = require('./models/Plan');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Serve static frontend files
app.use(express.static(path.join(__dirname)));
// Serve uploaded media
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure directories and files exist
if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
    fs.mkdirSync(path.join(__dirname, 'uploads'));
}

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Cloudinary Config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer storage engine (Cloudinary)
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'arch-plan-manager',
        // Use 'raw' instead of 'image' to bypass Cloudinary's default Strict PDF delivery restrictions
        resource_type: 'raw',
        // We strictly DO NOT include format: 'pdf' here. 
        // If the URL ends in .pdf, Cloudinary's Strict PDF Delivery ACL blocks it with a 401 error.
        // Our backend proxy will artificially add the PDF Content-Type header when fetching the raw file later.
    },
});
const upload = multer({ storage: storage });

// --- API Routes ---

// Get all plans
app.get('/api/plans', async (req, res) => {
    try {
        const plans = await Plan.find().sort({ order: 1, createdAt: -1 });
        // Map _id to id for frontend compatibility
        const formattedPlans = plans.map(p => ({
            ...p.toObject(),
            id: p._id.toString()
        }));
        res.json(formattedPlans);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Proxy PDF to bypass Cloudinary limitations and force Content-Type
app.get('/api/proxy-pdf', async (req, res) => {
    try {
        const targetUrl = req.query.url;
        if (!targetUrl) return res.status(400).send('URL is required');

        if (!targetUrl.includes('cloudinary.com')) {
             return res.status(403).send('Invalid domain');
        }

        const fetch = (await import('node-fetch')).default;
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        });
        
        if (!response.ok) {
            console.error(`Cloudinary returned ${response.status} for ${targetUrl}`);
            throw new Error(`Failed to fetch: ${response.statusText}`);
        }

        // Force native PDF rendering by correcting Content-Type
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="plan.pdf"');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('X-Frame-Options', 'ALLOWALL');
        
        response.body.pipe(res);
    } catch (err) {
        console.error("Proxy error:", err);
        res.status(500).send('Error loading PDF');
    }
});

// Create new plan
app.post('/api/plans', upload.single('pdf'), async (req, res) => {
    try {
        const newPlan = new Plan({
            plot: req.body.plot,
            facing: req.body.facing,
            bhk: req.body.bhk,
            floors: req.body.floors,
            area: req.body.area,
            notes: req.body.notes,
            favorite: false,
            // req.file.path contains the secure Cloudinary URL when using CloudinaryStorage
            pdfUrl: req.file ? req.file.path : null,
            order: Date.now() // Simple default ordering
        });

        const savedPlan = await newPlan.save();
        const planObj = { ...savedPlan.toObject(), id: savedPlan._id.toString() };
        res.status(201).json(planObj);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update plan
app.put('/api/plans/:id', upload.single('pdf'), async (req, res) => {
    try {
        const updateData = {
            plot: req.body.plot,
            facing: req.body.facing,
            bhk: req.body.bhk,
            floors: req.body.floors,
            area: req.body.area,
            notes: req.body.notes,
        };
        
        if (req.file) {
            updateData.pdfUrl = req.file.path;
        }

        const updatedPlan = await Plan.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!updatedPlan) return res.status(404).json({ error: 'Not found' });
        
        const planObj = { ...updatedPlan.toObject(), id: updatedPlan._id.toString() };
        res.json(planObj);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete plan
app.delete('/api/plans/:id', async (req, res) => {
    try {
        const plan = await Plan.findById(req.params.id);
        if (!plan) return res.status(404).json({ error: 'Plan not found' });

        // If the plan has a Cloudinary PDF, delete it from Cloudinary
        if (plan.pdfUrl && plan.pdfUrl.includes('cloudinary.com')) {
            try {
                // Extract public_id from Cloudinary URL
                // Example URL: https://res.cloudinary.com/difdmidpp/raw/upload/v1773208269/arch-plan-manager/my_pdf.pdf
                const urlParts = plan.pdfUrl.split('/');
                const folderIndex = urlParts.findIndex(part => part === 'arch-plan-manager');
                if (folderIndex !== -1) {
                    // Extract the folder and filename (without extension if it's an image type, or with extension if raw)
                    let publicId = urlParts.slice(folderIndex).join('/');
                    
                    // Cloudinary 'raw' resource types need their extension in the public_id for deletion
                    // Cloudinary 'image' resource types do NOT need their extension
                    // For safety, we will try to delete it as a raw file first (which is our new standard)
                    await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
                    
                    // We also try as an image type (without extension) just in case it's an old upload
                    const publicIdNoExt = publicId.substring(0, publicId.lastIndexOf('.')) || publicId;
                    await cloudinary.uploader.destroy(publicIdNoExt, { resource_type: 'image' });
                }
            } catch (cloudErr) {
                console.error("Error deleting from Cloudinary:", cloudErr);
                // Continue with DB deletion even if Cloudinary fails, to not leave orphaned DB records
            }
        }

        await Plan.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Toggle Favorite
app.put('/api/plans/:id/favorite', async (req, res) => {
    try {
        const updatedPlan = await Plan.findByIdAndUpdate(
            req.params.id, 
            { favorite: req.body.favorite }, 
            { new: true }
        );
        if (!updatedPlan) return res.status(404).json({ error: 'Not found' });
        const planObj = { ...updatedPlan.toObject(), id: updatedPlan._id.toString() };
        res.json(planObj);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Reorder array completely (drag and drop)
app.post('/api/plans/reorder', async (req, res) => {
    try {
        const plans = req.body.plans;
        if (!plans || !Array.isArray(plans)) return res.status(400).json({ error: 'Invalid format' });
        
        // Update all documents with new order index
        const bulkOps = plans.map((plan, index) => ({
            updateOne: {
                filter: { _id: plan.id },
                update: { order: index }
            }
        }));
        
        if(bulkOps.length > 0) {
            await Plan.bulkWrite(bulkOps);
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// TEMPORARY WIPE ROUTE
app.delete('/api/wipe', async (req, res) => {
    try {
        // 1. Wipe Cloudinary Folder
        try {
            await cloudinary.api.delete_resources_by_prefix('arch-plan-manager/', { resource_type: 'image' });
            await cloudinary.api.delete_resources_by_prefix('arch-plan-manager/', { resource_type: 'raw' });
        } catch (cloudErr) {
            console.error("Cloudinary wipe error:", cloudErr.message || cloudErr);
        }

        // 2. Wipe MongoDB Collection
        const deleteCount = await Plan.deleteMany({});
        
        res.json({ success: true, message: `Wiped ${deleteCount.deletedCount} items.` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Plan Manager Server running on http://localhost:${PORT}`);
});
