const mongoose = require('mongoose');
const bcrypt= require('bcrypt');

// Decalre the schema of the Mongo model


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
    } 
);

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