import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  FileText, 
  X, 
  Upload, 
  Download, 
  FolderOpen,
  Trash2,
  Edit3,
  Search
} from 'lucide-react';

// --- Helper Functions ---
const generateId = () => Math.random().toString(36).substr(2, 9);

// --- Components ---

const PlanCard = ({ plan, onClick }) => {
  return (
    <div className="plan-card" onClick={() => onClick(plan)}>
      <div className="plan-icon-container">
        <FileText size={24} />
      </div>
      <div className="plan-meta">
        <span className="plan-title" title={plan.planName}>{plan.planName}</span>
        <div className="plan-subtitle">
          <span>{plan.dimensions}</span>
          <span>{plan.bhk}</span>
          <span>{plan.facing}</span>
        </div>
      </div>
    </div>
  );
};

const AddPlanModal = ({ isOpen, onClose, onAdd, editingPlan, onUpdate }) => {
  const [formData, setFormData] = useState({
    planName: '',
    dimensions: '30x40',
    bhk: '2BHK',
    facing: 'East',
    details: '',
  });
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (editingPlan) {
      setFormData({
        planName: editingPlan.planName,
        dimensions: editingPlan.dimensions,
        bhk: editingPlan.bhk,
        facing: editingPlan.facing,
        details: editingPlan.details || '',
      });
      setFile(null); // We don't edit the file
    } else {
      setFormData({ planName: '', dimensions: '30x40', bhk: '2BHK', facing: 'East', details: '' });
      setFile(null);
    }
  }, [editingPlan, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const processFile = (selectedFile) => {
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      alert("Please upload a PDF file.");
    }
  };

  const handleFileChange = (e) => {
    processFile(e.target.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.planName) {
      alert("Please enter a Plan Name.");
      return;
    }
    
    if (!editingPlan && !file) {
      alert("Please upload a PDF file.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingPlan) {
        // Update existing plan metadata
        const response = await fetch(`/api/plans/${editingPlan.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        
        if (!response.ok) throw new Error('Update failed');
        const updatedPlan = await response.json();
        onUpdate(updatedPlan);
      } else {
        // Create new plan
        const formPayload = new FormData();
        formPayload.append('planName', formData.planName);
        formPayload.append('dimensions', formData.dimensions);
        formPayload.append('bhk', formData.bhk);
        formPayload.append('facing', formData.facing);
        formPayload.append('details', formData.details);
        formPayload.append('pdfFile', file);

        const response = await fetch('/api/plans', {
          method: 'POST',
          body: formPayload,
        });
        
        if (!response.ok) throw new Error('Upload failed');
        const newPlan = await response.json();
        onAdd(newPlan);
      }
      
      // Modal closes automatically via onAdd/onUpdate
    } catch (err) {
      console.error(err);
      alert('Failed to save plan. Make sure the backend server is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">{editingPlan ? 'Edit Plan Details' : 'New Plan File'}</h2>
          <button className="btn-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Plan Name</label>
              <input 
                type="text" 
                className="form-control" 
                name="planName" 
                value={formData.planName} 
                onChange={handleInputChange} 
                placeholder="e.g., Modern Villa Design" 
                required 
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Dimensions</label>
                <select className="form-control" name="dimensions" value={formData.dimensions} onChange={handleInputChange}>
                  <option value="30x40">30 x 40</option>
                  <option value="30x50">30 x 50</option>
                  <option value="30x60">30 x 60</option>
                  <option value="40x60">40 x 60</option>
                  <option value="50x60">50 x 60</option>
                  <option value="50x80">50 x 80</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Configuration</label>
                <select className="form-control" name="bhk" value={formData.bhk} onChange={handleInputChange}>
                  <option value="1BHK">1 BHK</option>
                  <option value="2BHK">2 BHK</option>
                  <option value="3BHK">3 BHK</option>
                  <option value="4BHK">4 BHK</option>
                  <option value="5BHK+">5 BHK+</option>
                  <option value="Commercial">Commercial</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Facing Direction</label>
              <select className="form-control" name="facing" value={formData.facing} onChange={handleInputChange}>
                <option value="East">East Facing</option>
                <option value="West">West Facing</option>
                <option value="North">North Facing</option>
                <option value="South">South Facing</option>
                <option value="North-East">North-East Facing</option>
                <option value="South-East">South-East Facing</option>
                <option value="North-West">North-West Facing</option>
                <option value="South-West">South-West Facing</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Additional Details (Optional)</label>
              <textarea 
                className="form-control" 
                name="details" 
                value={formData.details} 
                onChange={handleInputChange} 
                placeholder="Any other specific requirements..."
              ></textarea>
            </div>

            {!editingPlan && (
              <div className="form-group" style={{ marginTop: '0.5rem' }}>
                <label className="form-label">PDF File</label>
                
                {!file ? (
                  <div 
                    className={`file-upload-area ${isDragging ? 'drag-active' : ''}`}
                    onClick={() => fileInputRef.current.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <Upload className="file-upload-icon" />
                    <div className="file-upload-text">Click to upload or drag file here</div>
                    <div className="file-upload-subtext">PDF only</div>
                  </div>
                ) : (
                  <div className="file-selected">
                    <FileText style={{ color: 'var(--accent-gold)' }} size={24} />
                    <div className="file-details">
                      <span className="file-name">{file.name}</span>
                      <span className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                    <button type="button" className="btn-close" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                      <X size={16} />
                    </button>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="application/pdf" 
                  onChange={handleFileChange} 
                />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
              <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save File'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const PlanDetailModal = ({ plan, isOpen, onClose, onEdit, onDelete }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !plan) return null;

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to permanently delete "${plan.planName}"? This will also remove the file from your computer.`)) {
      try {
        const response = await fetch(`/api/plans/${plan.id}`, { method: 'DELETE' });
        if (response.ok) {
          onDelete(plan.id);
          onClose();
        } else {
          throw new Error('Failed to delete');
        }
      } catch (e) {
        alert("Error deleting plan");
      }
    }
  };

  const handleOpenPdf = async (e) => {
    e.preventDefault();
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      window.open(plan.pdfPath, '_blank');
    } catch (err) {
      console.error(err);
      alert('Failed to open PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadPdf = async (e) => {
    e.preventDefault();
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const res = await fetch(plan.pdfPath);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = plan.pdfName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error(err);
      alert('Failed to download PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{plan.planName}</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-secondary" onClick={() => onEdit(plan)} style={{ padding: '0.4rem' }} title="Edit details">
              <Edit3 size={18} />
            </button>
            <button className="btn-secondary" onClick={handleDelete} style={{ padding: '0.4rem', color: '#dc2626' }} title="Delete plan">
              <Trash2 size={18} />
            </button>
            <button className="btn-close" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="plan-details-layout">
          
          <div className="pdf-preview-box">
            <FileText className="pdf-preview-icon" />
            <h3 style={{ fontSize: '1.1rem', marginTop: '0.5rem' }}>{plan.pdfName}</h3>
            
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button 
                onClick={handleOpenPdf}
                disabled={isProcessing}
                className="btn-secondary"
                style={{ opacity: isProcessing ? 0.7 : 1 }}
              >
                <FolderOpen size={16} /> {isProcessing ? 'Loading...' : 'Open'}
              </button>
              <button 
                onClick={handleDownloadPdf}
                disabled={isProcessing}
                className="btn-primary"
                style={{ opacity: isProcessing ? 0.7 : 1 }}
              >
                <Download size={16} /> {isProcessing ? 'Loading...' : 'Download'}
              </button>
            </div>
          </div>

          <div className="detail-grid">
            <div className="detail-section">
              <span className="detail-label">Dimensions</span>
              <div className="detail-value">{plan.dimensions}</div>
            </div>
            <div className="detail-section">
              <span className="detail-label">Configuration</span>
              <div className="detail-value">{plan.bhk}</div>
            </div>
            <div className="detail-section">
              <span className="detail-label">Facing</span>
              <div className="detail-value">{plan.facing}</div>
            </div>
            <div className="detail-section">
              <span className="detail-label">Date Added</span>
              <div className="detail-value">{new Date(plan.dateAdded).toLocaleDateString()}</div>
            </div>
          </div>

          {plan.details && (
            <div className="detail-section" style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <span className="detail-label" style={{ marginBottom: '0.25rem' }}>Additional Details</span>
              <div className="detail-value" style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem', lineHeight: 1.5 }}>
                {plan.details}
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

function App() {
  const [plans, setPlans] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [editingPlan, setEditingPlan] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Load from backend API
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch('/api/plans');
        if (response.ok) {
          const data = await response.json();
          setPlans(data);
        }
      } catch (e) {
        console.error("Error loading plans from backend:", e);
      } finally {
        setIsLoaded(true);
      }
    };
    
    fetchPlans();
  }, []);

  const handleAddPlan = (newPlan) => {
    setPlans(prev => [newPlan, ...prev]);
    setIsAddModalOpen(false);
  };

  const handleUpdatePlan = (updatedPlan) => {
    setPlans(prev => prev.map(p => p.id === updatedPlan.id ? updatedPlan : p));
    setIsAddModalOpen(false);
    setEditingPlan(null);
    if (selectedPlan && selectedPlan.id === updatedPlan.id) {
      setSelectedPlan(updatedPlan); // Update detail view if open
    }
  };

  const handleDeletePlan = (id) => {
    setPlans(prev => prev.filter(p => p.id !== id));
  };

  const openAddModal = () => {
    setEditingPlan(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (plan) => {
    setEditingPlan(plan);
    setIsAddModalOpen(true);
  };

  const filteredPlans = plans.filter(plan => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (plan.planName && plan.planName.toLowerCase().includes(query)) ||
      (plan.dimensions && plan.dimensions.toLowerCase().includes(query)) ||
      (plan.bhk && plan.bhk.toLowerCase().includes(query)) ||
      (plan.facing && plan.facing.toLowerCase().includes(query)) ||
      (plan.details && plan.details.toLowerCase().includes(query))
    );
  });

  return (
    <>
      <header className="app-header">
        <div className="brand-title" style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <img src="/logo.png" alt="Syam Infra Logo" style={{ height: '240px', objectFit: 'contain', margin: '-40px 0' }} />
        </div>
        
        <div style={{ flex: 2, display: 'flex', justifyContent: 'center', padding: '0 1rem' }}>
          <div className="search-container" style={{ position: 'relative', width: '100%', maxWidth: '500px' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search plans (e.g., 3BHK, East, 30x40)..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '42px', paddingRight: '42px', borderRadius: '24px', width: '100%', height: '44px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}
            />
            {searchQuery && (
              <X 
                size={16} 
                style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', cursor: 'pointer' }} 
                onClick={() => setSearchQuery('')}
              />
            )}
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-primary" onClick={openAddModal}>
            <Plus size={16} />
            <span>Upload File</span>
          </button>
        </div>
      </header>

      <main className="main-content">
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-main)' }}>Plan Repository</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>All uploaded plan documents</p>
        </div>

        {plans.length === 0 ? (
          <div className="empty-state">
            <FolderOpen className="empty-icon" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Folder is empty</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Upload your first plan PDF here.</p>
            <button className="btn-secondary" onClick={openAddModal} style={{ marginTop: '0.5rem' }}>
              Upload File
            </button>
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="empty-state">
            <Search className="empty-icon" style={{ opacity: 0.5 }} />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>No matching plans found</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Try a different search term.</p>
            <button className="btn-secondary" onClick={() => setSearchQuery('')} style={{ marginTop: '0.5rem' }}>
              Clear Search
            </button>
          </div>
        ) : (
          <div className="file-grid">
            {filteredPlans.map(plan => (
              <PlanCard 
                key={plan.id} 
                plan={plan} 
                onClick={(p) => setSelectedPlan(p)} 
              />
            ))}
          </div>
        )}
      </main>

      <AddPlanModal 
        isOpen={isAddModalOpen} 
        onClose={() => { setIsAddModalOpen(false); setEditingPlan(null); }} 
        onAdd={handleAddPlan} 
        editingPlan={editingPlan}
        onUpdate={handleUpdatePlan}
      />

      <PlanDetailModal 
        plan={selectedPlan}
        isOpen={!!selectedPlan}
        onClose={() => setSelectedPlan(null)}
        onEdit={openEditModal}
        onDelete={handleDeletePlan}
      />
    </>
  );
}

export default App;
