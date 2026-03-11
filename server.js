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
        // 'image' resource type with 'pdf' format allows reliable PDF delivery and transformation on Cloudinary
        resource_type: 'image',
        format: 'pdf',
        // Optional: you can add fl_attachment:false to force inline viewing but standard image/pdf usually works in iframes
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

// Proxy PDF to bypass Cloudinary X-Frame-Options or CORS issues in iframes
app.get('/api/proxy-pdf', async (req, res) => {
    try {
        const targetUrl = req.query.url;
        if (!targetUrl) return res.status(400).send('URL is required');

        // Allow fetching from cloudinary
        if (!targetUrl.includes('cloudinary.com')) {
             return res.status(403).send('Invalid domain');
        }

        const fetch = (await import('node-fetch')).default;
        const response = await fetch(targetUrl);
        
        if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);

        // Set headers to force inline rendering in the browser
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="plan.pdf"');
        
        // Pipe the response stream directly to the client
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Plan Manager Server running on http://localhost:${PORT}`);
});
