const mongoose = require('mongoose'); 

const productSchema = new mongoose.Schema({
   
    title:{
        type:String,
        required:true,
       trim:true
      
    },
    slug:{
        type:String,
        required:true,
        unique:true,
        lowercase:true
    },
    description:{
        type:String,
        required:true,
       
    },
    brand:{
        type:String,
       required:true
    },
    price:{
        type:Number,
        required:true,
    },
    category:{
        type:String,
       required:true,
    },
    quantity:{
        type:Number,     
        default:0
    },
    sold:{
        type:Number,
        default:0,
        select:false
    },
    size :{
        type:String,
        default:"M"       
    },
   
    images:{
        type:Array,
    },
    color:{
        type:String,
       required:true
    },
    rating:[{
        star:Number,
        postedby:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
    }],
    status:{
        type:Boolean,
        default:true
    },
    isDeleted:{
        type:Boolean,
        default:false
    }
   
    
},{timestamps:true});

//Export the model
module.exports = mongoose.model('Product', productSchema);