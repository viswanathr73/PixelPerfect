// const asyncHandler=require('express-async-handler')
// const User=require('../model/userModel')
// const Product=require('../model/productModel')


// //add money to wallet function----------------------------------------------------

// const addMoneyWallet = asyncHandler(async (req, res) => {
//     try {
//         const amount = req.body.amount;

//         // Generate a unique order ID for each transaction
//         const orderId = generateUniqueOrderId();
//         const generatedOrder = await generateOrderRazorpay(orderId, amount);
       
        
//        console.log('this is genmatrator the walet order',generateOrderRazorpay);
//         res.json({razorpayOrder: generatedOrder,status:true})
    
//     } catch (error) {
//        console.log('Error hapence in the wallet ctrl in the funtion  addMoneyWallet',error);
//         res.status(500).json({ error: "Internal server error" });
//     }
// });


// module.exports={
//     addMoneyWallet,
    
// }