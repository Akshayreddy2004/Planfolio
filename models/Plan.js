const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
    plot: { type: String, required: true },
    facing: { type: String, required: true },
    bhk: { type: String, required: true },
    floors: { type: String, required: true },
    area: { type: String, required: true },
    notes: { type: String },
    favorite: { type: Boolean, default: false },
    pdfUrl: { type: String },
    order: { type: Number, default: 0 } // For SortableJS reordering
}, { timestamps: true });

module.exports = mongoose.model('Plan', planSchema);
