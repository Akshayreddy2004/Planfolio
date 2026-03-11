// Initializer
let plansData = [];

async function fetchPlans() {
    try {
        const res = await fetch('/api/plans');
        if (res.ok) {
            plansData = await res.json();
            renderDashboard();
        }
    } catch (e) {
        console.error("Failed to fetch plans:", e);
        showToast("Error connecting to local server.", "error");
    }
}

// Toast Notifications
function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = type === 'success' ? '<i class="fa-solid fa-check"></i>' : '<i class="fa-solid fa-triangle-exclamation"></i>';
    toast.innerHTML = `${icon} <span>${message}</span>`;

    toastContainer.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 50);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}

// DOM Elements
const plansGrid = document.getElementById('plans-grid');
const totalPlansCount = document.getElementById('total-plans-count');
const statsText = document.querySelector('.stats-text');

const searchInput = document.getElementById('search-input');
const toggleFiltersBtn = document.getElementById('toggle-filters-btn');
const filtersPanel = document.getElementById('filters-panel');
const filterPlot = document.getElementById('filter-plot');
const filterFacing = document.getElementById('filter-facing');
const filterBhk = document.getElementById('filter-bhk');
const clearFiltersBtn = document.getElementById('clear-filters');

const uploadModal = document.getElementById('upload-modal');
const addPlanBtn = document.getElementById('add-plan-btn');
const closeUploadModal = document.getElementById('close-upload-modal');
const uploadForm = document.getElementById('upload-form');

const presentationModal = document.getElementById('presentation-modal');
const closePresentation = document.getElementById('close-presentation');
const presentationTitle = document.getElementById('presentation-title');
const presentationDesc = document.getElementById('presentation-desc');
const tagFacing = document.getElementById('tag-facing');
const tagBhk = document.getElementById('tag-bhk');
const tagArea = document.getElementById('tag-area');
const tagFloors = document.getElementById('tag-floors');

const downloadPdfBtn = document.getElementById('download-pdf-btn');
const waShareBtn = document.getElementById('wa-share-btn');
const deletePlanBtn = document.getElementById('delete-plan-btn');
const pdfIframe = document.getElementById('pdf-iframe');
const pinViewImg = document.getElementById('pin-view-img');
const noPdfMessage = document.getElementById('no-pdf-message');

const navDashboard = document.getElementById('nav-dashboard');
const navFavorites = document.getElementById('nav-favorites');
const navRecent = document.getElementById('nav-recent');

// Mobile Nav
const mobNavDashboard = document.getElementById('mob-nav-dashboard');
const mobNavFavorites = document.getElementById('mob-nav-favorites');
const mobNavRecent = document.getElementById('mob-nav-recent');

const pinViewSaveBtn = document.getElementById('pin-view-save');

// State
let currentPresentationPlan = null;
let showFavoritesOnly = false;
let showRecentOnly = false;
let recentPlanIds = JSON.parse(localStorage.getItem('archFolioRecent_v3')) || [];

function saveRecent() {
    localStorage.setItem('archFolioRecent_v3', JSON.stringify(recentPlanIds));
}

// Initialize
function init() {
    bindEvents();
    fetchPlans();
    
    // Simple drag and drop styling
    initDropzones();
    
    // Hide Loader
    setTimeout(() => {
        const loader = document.getElementById('page-loader');
        if(loader) {
            loader.classList.add('hidden');
            setTimeout(() => loader.remove(), 800); // Remove from DOM after fade
        }
    }, 1200);

    // Initialize Drag and Drop
    initSortable();
}

let sortableInstance = null;
function initSortable() {
    if(typeof Sortable !== 'undefined') {
        sortableInstance = new Sortable(plansGrid, {
            animation: 150,
            ghostClass: 'sortable-ghost',
            onEnd: async function (evt) {
                // Determine new order based on DOM
                const newIdsOrder = Array.from(plansGrid.children).map(card => card.dataset.id);
                // Sort plansData to match
                plansData.sort((a, b) => newIdsOrder.indexOf(a.id) - newIdsOrder.indexOf(b.id));
                
                try {
                    await fetch('/api/plans/reorder', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ plans: plansData })
                    });
                    showToast("Portfolio order updated");
                } catch(e) {
                    showToast("Error saving order", "error");
                }
            }
        });
    }
}

function initDropzones() {
    // Just handling UI for the PDF dropzone
    const pdfZone = document.getElementById('drop-zone-pdf');
    const pdfInput = document.getElementById('up-pdf-main');
    const pdfText = pdfZone.querySelector('span');

    pdfZone.addEventListener('click', () => pdfInput.click());
    pdfInput.addEventListener('change', e => {
        if(e.target.files.length) {
            pdfText.innerHTML = `<i class="fa-solid fa-check"></i> ${e.target.files[0].name}`;
            pdfText.style.color = "var(--brand-red)";
        }
    });
}

// Events
function bindEvents() {
    // Nav
    const updateNav = (activeEl, activeMobEl) => {
        document.querySelectorAll('.sidebar-nav li').forEach(li => li.classList.remove('active'));
        document.querySelectorAll('.mobile-bottom-nav li').forEach(li => li.classList.remove('active'));
        if(activeEl) activeEl.parentElement.classList.add('active');
        if(activeMobEl) activeMobEl.parentElement.classList.add('active');
    };

    navDashboard.addEventListener('click', (e) => { e.preventDefault(); showFavoritesOnly = false; showRecentOnly = false; updateNav(navDashboard, mobNavDashboard); renderDashboard(); });
    navFavorites.addEventListener('click', (e) => { e.preventDefault(); showFavoritesOnly = true; showRecentOnly = false; updateNav(navFavorites, mobNavFavorites); renderDashboard(); });
    navRecent.addEventListener('click', (e) => { e.preventDefault(); showFavoritesOnly = false; showRecentOnly = true; updateNav(navRecent, mobNavRecent); renderDashboard(); });

    mobNavDashboard.addEventListener('click', (e) => { e.preventDefault(); showFavoritesOnly = false; showRecentOnly = false; updateNav(navDashboard, mobNavDashboard); renderDashboard(); });
    mobNavFavorites.addEventListener('click', (e) => { e.preventDefault(); showFavoritesOnly = true; showRecentOnly = false; updateNav(navFavorites, mobNavFavorites); renderDashboard(); });
    mobNavRecent.addEventListener('click', (e) => { e.preventDefault(); showFavoritesOnly = false; showRecentOnly = true; updateNav(navRecent, mobNavRecent); renderDashboard(); });

    // Filters Toggle
    toggleFiltersBtn.addEventListener('click', () => {
        filtersPanel.classList.toggle('show');
        toggleFiltersBtn.style.color = filtersPanel.classList.contains('show') ? 'var(--brand-red)' : 'inherit';
    });

    // Filters Actions
    [searchInput, filterPlot, filterFacing, filterBhk].forEach(el => {
        el.addEventListener('input', renderDashboard);
        el.addEventListener('change', renderDashboard);
    });

    clearFiltersBtn.addEventListener('click', () => {
        searchInput.value = '';
        filterPlot.value = 'all';
        filterFacing.value = 'all';
        filterBhk.value = 'all';
        renderDashboard();
    });

    // Modals
    addPlanBtn.addEventListener('click', () => {
        uploadForm.reset();
        document.getElementById('up-id').value = '';
        document.getElementById('modal-title').textContent = 'Upload File';
        
        document.querySelector('#drop-zone-pdf span').innerHTML = '<i class="fa-regular fa-file-pdf"></i> Attach PDF';
        document.querySelector('#drop-zone-pdf span').style.color = '';
        
        uploadModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    });

    const closeUpload = () => { uploadModal.classList.add('hidden'); document.body.style.overflow = ''; };
    closeUploadModal.addEventListener('click', closeUpload);
    document.querySelector('.close-modal-backdrop').addEventListener('click', closeUpload);

    const closePresent = () => { 
        presentationModal.classList.add('hidden'); 
        pdfIframe.src = ''; 
        document.body.style.overflow = ''; 
    };
    closePresentation.addEventListener('click', closePresent);
    document.querySelector('.close-presentation-backdrop').addEventListener('click', closePresent);

    uploadForm.addEventListener('submit', handleUpload);

    deletePlanBtn.addEventListener('click', async () => {
        if (!currentPresentationPlan) return;
        
        if (confirm("Are you sure you want to delete this plan? This action cannot be undone.")) {
            try {
                const res = await fetch(`/api/plans/${currentPresentationPlan.id}`, {
                    method: 'DELETE'
                });
                if (res.ok) {
                    showToast("Plan deleted successfully.");
                    closePresent();
                    fetchPlans(); // Refresh the grid
                } else {
                    showToast("Failed to delete plan", "error");
                }
            } catch (e) {
                console.error(e);
                showToast("Error connecting to server", "error");
            }
        }
    });

    pinViewSaveBtn.addEventListener('click', async () => {
        if(currentPresentationPlan) {
            currentPresentationPlan.favorite = !currentPresentationPlan.favorite;
            
            try {
                await fetch(`/api/plans/${currentPresentationPlan.id}/favorite`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ favorite: currentPresentationPlan.favorite })
                });
                renderDashboard();
                pinViewSaveBtn.textContent = currentPresentationPlan.favorite ? 'Saved' : 'Save';
                pinViewSaveBtn.style.backgroundColor = currentPresentationPlan.favorite ? 'var(--text-primary)' : 'var(--brand-red)';
                showToast(currentPresentationPlan.favorite ? 'Saved to board' : 'Removed from board');
            } catch(e) {
                showToast("Error updating favorite", "error");
            }
        }
    });
}

async function handleUpload(e) {
    e.preventDefault();

    const idField = document.getElementById('up-id').value;
    const isEditing = idField !== '';

    const formData = new FormData();
    formData.append('plot', document.getElementById('up-plot').value);
    formData.append('facing', document.getElementById('up-facing').value);
    formData.append('bhk', document.getElementById('up-bhk').value);
    formData.append('floors', document.getElementById('up-floors').value);
    formData.append('area', document.getElementById('up-area').value);
    formData.append('notes', document.getElementById('up-notes').value);

    const pdfFile = document.getElementById('up-pdf-main').files[0];

    if (pdfFile) formData.append('pdf', pdfFile);

    try {
        const url = isEditing ? `/api/plans/${idField}` : '/api/plans';
        const method = isEditing ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method: method,
            body: formData
        });
        
        if (res.ok) {
            uploadModal.classList.add('hidden');
            document.body.style.overflow = '';
            await fetchPlans();
            showToast(isEditing ? 'File updated' : 'File uploaded');
        } else {
            showToast("Error uploading file", "error");
        }
    } catch (e) {
        showToast("Error uploading file", "error");
    }
}

// Generate random height for placeholders to simulate masonry effect if no image
function getRandomHeight() {
    const heights = ['200px', '250px', '320px', '380px'];
    return heights[Math.floor(Math.random() * heights.length)];
}

function parseNaturalLanguageQuery(query) {
    const parsedParams = { text: query, bhk: null, facing: null, plot: null };
    
    // Extract BHK (e.g., "3 bhk", "2bhk", "4 bedrooms")
    const bhkMatch = query.match(/(\d+)\s*(bhk|bedrooms?|beds?)/i);
    if (bhkMatch) { parsedParams.bhk = bhkMatch[1]; parsedParams.text = parsedParams.text.replace(bhkMatch[0], ''); }
    
    // Extract Facing (e.g., "north facing", "east")
    const facingMatch = query.match(/(north|south|east|west)/i);
    if (facingMatch) { 
        parsedParams.facing = facingMatch[1].charAt(0).toUpperCase() + facingMatch[1].slice(1).toLowerCase(); 
        parsedParams.text = parsedParams.text.replace(facingMatch[0], '').replace(/facing/i, ''); 
    }
    
    // Extract Plot Size (e.g., "30x40")
    const plotMatch = query.match(/(\d{2,3})\s*[xX*]\s*(\d{2,3})/);
    if (plotMatch) { parsedParams.plot = plotMatch[0].toLowerCase(); parsedParams.text = parsedParams.text.replace(plotMatch[0], ''); }

    parsedParams.text = parsedParams.text.trim();
    return parsedParams;
}

function renderDashboard() {
    let filtered = plansData;
    const rawQuery = searchInput.value.toLowerCase();
    
    // Smart AI NLP Search
    const aiParams = parseNaturalLanguageQuery(rawQuery);

    if (aiParams.text) {
        filtered = filtered.filter(p => 
            p.plot.toLowerCase().includes(aiParams.text) || 
            (p.notes && p.notes.toLowerCase().includes(aiParams.text))
        );
    }
    
    // Apply AI Extracted Filters (Overrides manual dropdowns if detected in text)
    const activeBhk = aiParams.bhk || filterBhk.value;
    const activeFacing = aiParams.facing || filterFacing.value;
    let activePlot = filterPlot.value;
    
    if (aiParams.plot) {
        filtered = filtered.filter(p => p.plot.toLowerCase().includes(aiParams.plot));
    } else if (activePlot !== 'all' && activePlot !== 'custom') {
        filtered = filtered.filter(p => p.plot.includes(activePlot));
    }

    if (activeFacing !== 'all') filtered = filtered.filter(p => p.facing === activeFacing);
    if (activeBhk !== 'all') filtered = filtered.filter(p => p.bhk === activeBhk);

    if (showFavoritesOnly) {
        filtered = filtered.filter(p => p.favorite);
        document.querySelector('.page-title').textContent = "Saved";
    } else if (showRecentOnly) {
        filtered = filtered.filter(p => recentPlanIds.includes(p.id));
        filtered.sort((a,b) => recentPlanIds.indexOf(a.id) - recentPlanIds.indexOf(b.id));
        document.querySelector('.page-title').textContent = "Recent";
    } else {
        document.querySelector('.page-title').textContent = "Home";
    }
    
    if(showFavoritesOnly || showRecentOnly || rawQuery) {
         document.querySelector('.page-title').style.display = 'block';
    } else {
         document.querySelector('.page-title').style.display = 'none';
    }

    totalPlansCount.textContent = filtered.length;
    statsText.classList.remove('hidden');

    plansGrid.innerHTML = '';
    
    if (filtered.length === 0) {
        plansGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px; color: var(--text-tertiary);">
                <i class="fa-solid fa-folder-open" style="font-size: 3rem; opacity: 0.2; margin-bottom: 16px; display: block;"></i>
                <h3 style="font-family: var(--font-ui); font-size: 1.2rem; color: var(--text-secondary);">No files found</h3>
            </div>`;
        return;
    }

    filtered.forEach((plan, index) => {
        const card = document.createElement('div');
        card.className = 'pin-card';
        card.dataset.id = plan.id; // For Sortable
        
        // Staggered entry animation for shuffle effect
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px) scale(0.95)';
        card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
        }, 50 * index);

        let mediaHtml = ``;
        if (plan.pdfUrl) {
            mediaHtml = `<div class="pin-placeholder"><i class="fa-solid fa-file-pdf" style="color: #d42222; font-size: 3rem;"></i></div>`;
        } else {
            mediaHtml = `<div class="pin-placeholder"><i class="fa-solid fa-file-lines" style="font-size: 3rem;"></i></div>`;
        }

        card.innerHTML = `
            <div class="pin-img-container" onclick="openPresentation('${plan.id}')">
                ${mediaHtml}
            </div>
            <div class="pin-title" title="${plan.plot}">${plan.plot}</div>
            <div class="pin-info" style="flex-direction: row; justify-content: space-between; width: 100%; padding: 0 4px; align-items: center;">
                <span>${plan.bhk} BHK • ${plan.area || '--'} sqft</span>
                <button class="icon-btn fav-btn" onclick="toggleFavorite(event, '${plan.id}')" style="width: 28px; height: 28px; font-size: 1rem; color: ${plan.favorite ? 'var(--brand-red)' : 'var(--text-secondary)'};">
                    <i class="${plan.favorite ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
                </button>
            </div>
        `;

        // Add a simple right click to edit behavior for desktop feel
        card.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            openEditModal(plan);
        });

        plansGrid.appendChild(card);
    });
}

window.toggleFavorite = async function(e, id) {
    e.stopPropagation();
    const plan = plansData.find(p => p.id === id);
    if (!plan) return;

    plan.favorite = !plan.favorite;
    try {
        await fetch(`/api/plans/${id}/favorite`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ favorite: plan.favorite })
        });
        renderDashboard();
        showToast(plan.favorite ? 'Saved to favorites' : 'Removed from favorites');
    } catch(err) {
        plan.favorite = !plan.favorite; // revert
        showToast("Error updating favorite", "error");
    }
};

function openEditModal(plan) {
    document.getElementById('up-id').value = plan.id;
    document.getElementById('up-plot').value = plan.plot;
    document.getElementById('up-facing').value = plan.facing;
    document.getElementById('up-bhk').value = plan.bhk;
    document.getElementById('up-floors').value = plan.floors;
    document.getElementById('up-area').value = plan.area;
    document.getElementById('up-notes').value = plan.notes;

    document.getElementById('modal-title').textContent = 'Edit File';
    
    uploadModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function getSimilarPlans(targetPlan) {
    if (!targetPlan) return [];
    
    let scoredPlans = plansData.map(plan => {
        if (plan.id === targetPlan.id) return { plan, score: -1 }; // Exclude self
        
        let score = 0;
        if (plan.facing === targetPlan.facing) score += 3;
        if (plan.bhk === targetPlan.bhk) score += 2;
        if (plan.floors === targetPlan.floors) score += 1;
        
        // Similar area (+/- 200 sqft)
        const areaA = parseInt(plan.area) || 0;
        const areaB = parseInt(targetPlan.area) || 0;
        if (areaA && areaB && Math.abs(areaA - areaB) <= 200) score += 2;
        
        return { plan, score };
    });
    
    // Sort by score desc, filter out zero scores if we want, take top 4
    scoredPlans.sort((a, b) => b.score - a.score);
    return scoredPlans.filter(sp => sp.score > 0).slice(0, 4).map(sp => sp.plan);
}

function openPresentation(id) {
    const plan = plansData.find(p => p.id === id);
    if (!plan) return;

    currentPresentationPlan = plan;

    recentPlanIds = recentPlanIds.filter(pid => pid !== id);
    recentPlanIds.unshift(id);
    saveRecent();

    presentationTitle.textContent = plan.plot;
    presentationDesc.textContent = plan.notes || 'No description provided.';
    
    tagFacing.innerHTML = `<i class="fa-solid fa-compass"></i> ${plan.facing} Facing`;
    tagBhk.innerHTML = `<i class="fa-solid fa-bed"></i> ${plan.bhk} BHK`;
    tagArea.innerHTML = `<i class="fa-solid fa-vector-square"></i> ${plan.area} sqft`;
    tagFloors.innerHTML = `<i class="fa-solid fa-layer-group"></i> ${plan.floors}`;

    pinViewSaveBtn.textContent = plan.favorite ? 'Saved' : 'Save';
    pinViewSaveBtn.style.backgroundColor = plan.favorite ? 'var(--text-primary)' : 'var(--brand-red)';

    let currentIframe = document.getElementById('pdf-iframe');
    if (currentIframe) {
        currentIframe.classList.add('hidden');
        currentIframe.src = '';
    }
    noPdfMessage.classList.add('hidden');

    // Show PDF if available, else generic icon
    if (plan.pdfUrl) {
        let displayUrl = plan.pdfUrl;
        
        // Ensure Cloudinary URLs are forced to display inline and use HTTPS
        if (displayUrl.includes('cloudinary.com')) {
            // Force HTTPS
            displayUrl = displayUrl.replace(/^http:\/\//i, 'https://');
            
            // Remove any faulty fl_attachment:false added previously
            displayUrl = displayUrl.replace('/upload/fl_attachment:false/', '/upload/');
        }

        // We will directly use the Cloudinary secure URL. 
        // Cloudinary handles PDF rendering natively when served over HTTPS.
        const finalUrl = displayUrl;

        // It is better to just update src and remove hidden, rather than replacing outerHTML
        if (!currentIframe) {
            // In case it was completely replaced previously and we couldn't find it
            const container = document.getElementById('pdf-viewer-container');
            container.insertAdjacentHTML('afterbegin', `<iframe id="pdf-iframe" src="" frameborder="0" class="pdf-viewer"></iframe>`);
            currentIframe = document.getElementById('pdf-iframe');
        }
        
        // Restore standard iframe styling if it was modified
        currentIframe.style = 'width: 100%; height: 100%; border: none;'; 
        currentIframe.className = 'pdf-viewer';
        // Set to Cloudinary URL
        currentIframe.src = finalUrl;
        currentIframe.classList.remove('hidden');

        downloadPdfBtn.href = plan.pdfUrl;
        
        // Proper filename generation
        const safePlot = plan.plot ? plan.plot.replace(/[^a-z0-9]/gi, '_') : 'Plan';
        const bhkStr = plan.bhk ? `_${plan.bhk}BHK` : '';
        const facingStr = plan.facing ? `_${plan.facing}` : '';
        const properFileName = `${safePlot}${bhkStr}${facingStr}.pdf`;
        
        downloadPdfBtn.download = properFileName;
        downloadPdfBtn.style.display = 'flex';
        
        if (waShareBtn) {
            waShareBtn.style.display = 'flex';
            waShareBtn.onclick = async (e) => {
                e.preventDefault();
                showToast("Preparing file for WhatsApp...");
                try {
                    const response = await fetch(plan.pdfUrl);
                    const blob = await response.blob();
                    const file = new File([blob], properFileName, { type: 'application/pdf' });
                    
                    if (navigator.canShare && navigator.canShare({ files: [file] })) {
                        await navigator.share({
                            title: `${plan.plot} Plan`,
                            text: `Here is the architectural plan: ${plan.plot} (${plan.bhk} BHK, ${plan.facing} Facing).`,
                            files: [file]
                        });
                    } else {
                        // Fallback implementation: download the file and open WA Web
                        const text = encodeURIComponent(`Here is the architectural plan: ${plan.plot} (${plan.bhk} BHK, ${plan.facing} Facing).`);
                        window.open(`https://wa.me/?text=${text}`, '_blank');
                        
                        const tempLink = document.createElement('a');
                        tempLink.href = URL.createObjectURL(blob);
                        tempLink.download = properFileName;
                        tempLink.click();
                        URL.revokeObjectURL(tempLink.href);
                        
                        showToast("File downloaded. Please attach it manually in WhatsApp.", "success");
                    }
                } catch (err) {
                    console.error("Share error:", err);
                    if (err.name !== 'AbortError') {
                        showToast("Sharing failed or was cancelled.", "error");
                    }
                }
            };
        }

    } else {
        if (currentIframe) currentIframe.classList.add('hidden');
        noPdfMessage.classList.remove('hidden');
        downloadPdfBtn.style.display = 'none';
        if (waShareBtn) waShareBtn.style.display = 'none';
    }

    presentationModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Render Similar Plans
    const similarGrid = document.getElementById('similar-plans-grid');
    similarGrid.innerHTML = '';
    const recommendedPlans = getSimilarPlans(plan);
    
    if (recommendedPlans.length === 0) {
        similarGrid.innerHTML = `<p style="font-size: 0.85rem; color: var(--text-secondary);">No similar plans found.</p>`;
    } else {
        recommendedPlans.forEach(sim => {
            const simCard = document.createElement('div');
            simCard.className = 'similar-card';
            simCard.title = sim.plot;
            simCard.onclick = () => { closePresent(); openPresentation(sim.id); };
            
            if (sim.pdfUrl) {
                simCard.innerHTML = `<div class="sim-placeholder"><i class="fa-solid fa-file-pdf" style="color:#d42222;"></i></div>`;
            } else {
                simCard.innerHTML = `<div class="sim-placeholder"><i class="fa-solid fa-file-lines"></i></div>`;
            }
            similarGrid.appendChild(simCard);
        });
    }
}

document.addEventListener('DOMContentLoaded', init);
