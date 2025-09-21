const { name } = require('ejs');
const mongoose = require('mongoose');

const VenueSchema = new mongoose.Schema({
    name:String,
    address:String,
    capacity:Number,
    facilities:[String],
    city:String,
    rating:Number,
    typeofvenue:String,
    image: {
        url: String,
        public_id: String
    },
    map: {
        url: String,
        public_id: String
    }

});

module.exports = mongoose.model("Venue", VenueSchema);
