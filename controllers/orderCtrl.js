const asyncHandler = require("express-async-handler");
const User = require('../model/userModel');
const product = require('../model/productModel');


//checkout---------------------------------------------------
// const checkOut=asyncHandler(async(req,res)=>{
//     try{
//         const userId=req.session.User;
//         const user=await User.findById(userId);
       
//         const productId=user.cart.map(item=>item.productId);
//         const product=await product.find({_id:{$in:productId}});

//         console.log('this is product',product);
//         console.log('this is address',user.address.length);
//         console.log('this is address',useraddress);






//     }
// })