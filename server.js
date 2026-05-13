import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Ensure directories exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const dbPath = path.join(__dirname, 'database.json');
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify([]));
}

app.use(cors());
app.use(express.json());
// Serve the uploads folder statically so the frontend can link to the files directly
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure Multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const planName = req.body.planName || file.originalname.replace(/\.pdf$/i, '');
    const safePlanName = planName.replace(/[^a-z0-9\s-]/gi, '').trim().replace(/\s+/g, '-');
    const ext = path.extname(file.originalname) || '.pdf';
    
    // Check if file exists to prevent overwriting
    let finalName = safePlanName + ext;
    let counter = 1;
    while (fs.existsSync(path.join(uploadsDir, finalName))) {
      finalName = `${safePlanName}-${counter}${ext}`;
      counter++;
    }
    
    cb(null, finalName);
  }
});

const upload = multer({ storage: storage });

// Database helper functions
const getPlans = () => JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const savePlans = (plans) => fs.writeFileSync(dbPath, JSON.stringify(plans, null, 2));

// API Endpoints

// Get all plans
app.get('/api/plans', (req, res) => {
  try {
    const plans = getPlans();
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read database' });
  }
});

// Add a new plan with file upload
app.post('/api/plans', upload.single('pdfFile'), (req, res) => {
  try {
    const { planName, dimensions, bhk, facing, details } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'Please upload a PDF file' });
    }

    const newPlan = {
      id: Math.random().toString(36).substr(2, 9),
      planName,
      dimensions,
      bhk,
      facing,
      details,
      pdfName: file.filename, // Store actual saved filename
      pdfPath: `/uploads/${file.filename}`,
      dateAdded: new Date().toISOString()
    };

    const plans = getPlans();
    plans.unshift(newPlan); // Add to beginning
    savePlans(plans);

    res.status(201).json(newPlan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save plan' });
  }
});

// Update a plan (metadata only)
app.put('/api/plans/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { planName, dimensions, bhk, facing, details } = req.body;
    
    const plans = getPlans();
    const index = plans.findIndex(p => p.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    
    plans[index] = {
      ...plans[index],
      planName,
      dimensions,
      bhk,
      facing,
      details
    };
    
    savePlans(plans);
    res.json(plans[index]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update plan' });
  }
});

// Delete a plan and its file
app.delete('/api/plans/:id', (req, res) => {
  try {
    const { id } = req.params;
    const plans = getPlans();
    const index = plans.findIndex(p => p.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    
    const planToDelete = plans[index];
    
    // Delete the physical file
    if (planToDelete.pdfPath) {
      const filePath = path.join(__dirname, planToDelete.pdfPath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    // Remove from database
    plans.splice(index, 1);
    savePlans(plans);
    
    res.json({ message: 'Plan deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete plan' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
