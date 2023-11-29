const mongoose = require('mongoose');
const bcrypt= require('bcrypt');




//address schema---------------------------------------------

const addressSchema = new mongoose.Schema({
  fullName: {
      type: String,
      required: true,
  },
  mobile: {
      type: Number,
      required: true,
  },
  region: {
      type: String,
      required: true,
  },
  pinCode: {
      type: Number,
      required: true,
  },
  addressLine: {
      type: String,
      required: true,
  },
  areaStreet: {
      type: String,
      required: true,
  },
  ladmark: {
      type: String,
      required: true,
  },
  townCity: {
      type: String,
      required: true,
  },
  state: {
      type: String,
      required: true,
  },
  addressType: {
      type: String,
      default:"Home"
  },
  main: {
      type: Boolean,
      default: false,
  },
});


//user Schema----------------------------------------
var userSchema = new mongoose.Schema({
  username:{
       type: String,
       required:true,
       unique:true,
       index:true,
     },
     email:{
       type: String,
       required:true,
       unique:true,
     },
     mobile:{
       type: String,
       required:true,
       unique:true,
     },
     password:{
       type: String,
       required:true,
      },
     isAdmin:{
       type:String,
       default:"0",
     },
     isBlocked:{
       type: Boolean,
       default:false,
     },
     isActive:{
       type: Boolean,
       default:true,
     },
     address: [addressSchema],
    image:{
        type:String
    },
    cart:[{
        
      ProductId:{
          type: mongoose.Schema.Types.ObjectId,
          required:true,
          ref: "Product"
      },
      quantity: {
          type: Number,
          required: true,
         
      },
      subTotal: {
          type: Number,
          required: true,
      },
      total:{
          type:Number,
          required:true
          
      }
  }],
  wishlist:{
      type:Array,
      ProductId:{
          type:mongoose.Schema.Types.ObjectId,
          required:true,
          ref:"Product"
      },
  },
//   wallet: {
     
//       type:Number,
//       default:0,
//       required:true
     
      
//   },
  history: {
      type:Array,
      amount: {
          type: Number,
          required: true
      },
      status: {
          type: String,
          required: true
      },
      timestamp: {
          type: Date,
          default:Date.now,
          
      }
  }
   
   
    });

userSchema.pre("save",async function(next){
   if(!this.isModified("password")) return next();
   const salt = await bcrypt.genSalt(10);
   this.password = await bcrypt.hash(this.password,salt);
   next();
});
userSchema.methods.isPasswordMatched = async function (enteredPassword){
   return await bcrypt.compare(enteredPassword,this.password);
};

module.exports = mongoose.model('User',userSchema);