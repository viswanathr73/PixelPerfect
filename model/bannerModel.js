const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var bannerSchema = new mongoose.Schema({
    image:{
        type:String,
        required:true,
       
    },
    title:{
        type:String,
        required:true,
        
    },
    discription:{
        type:String,
        required:true,
       
    },
    link:{
        type:String,
        required:true,
    },
    date:{
        type:String,
        required:true
    }
});

module.exports = mongoose.model('Banner', bannerSchema);