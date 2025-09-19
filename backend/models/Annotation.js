const mongoose = require('mongoose');

const annotationSchema = new mongoose.Schema({
    type: { 
        type: String, 
        enum: ['marker', 'circle'], 
        required: true 
    },
    coords: Object,    // {lat, lng} for marker
    center: Object,    // {lat, lng} for circle
    radius: Number,    // radius for circle
    userId: {          // user who saved
        type: String,  // or mongoose.Schema.Types.ObjectId if you have a Users collection
        required: true
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Annotation', annotationSchema);
