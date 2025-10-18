const mongoose = require('mongoose');

const annotationSchema = new mongoose.Schema({
    type: { 
        type: String, 
        enum: ['marker', 'circle'], 
        required: true 
    },
    coords: Object,
    center: Object,
    radius: Number,
    notes: { type: String },   // <-- added field
    userId: {
        type: String,
        required: true
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Annotation', annotationSchema);
