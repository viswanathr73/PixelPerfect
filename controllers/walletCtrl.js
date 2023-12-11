const asyncHandler=require('express-async-handler')
const User=require('../model/userModel')
const Product=require('../model/productModel')
const Razorpay=require('razorpay')
const Coupon = require('../model/couponModel')

var instance = new Razorpay({ key_id:process.env.RAZORPAY_KEYID, key_secret: process.env.RAZORPAY_SECRETKEY })


const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEYID,
    key_secret: process.env.RAZORPAY_SECRETKEY,
});


//add money to wallet function----------------------------------------------------

const addMoneyWallet = asyncHandler(async (req, res) => {
    try {
        const amount = req.body.amount;

        // Generate a unique order ID for each transaction
        const orderId = generateUniqueOrderId();
        const generatedOrder = await generateOrderRazorpay(orderId, amount);
       
        
       console.log('this is genmatrator the walet order',generateOrderRazorpay);
        res.json({razorpayOrder: generatedOrder,status:true})
    
    } catch (error) {
       console.log('Error hapence in the wallet ctrl in the funtion  addMoneyWallet',error);
        res.status(500).json({ error: "Internal server error" });
    }
});


//generating a unique id for razor pay------------------------------------------

function generateUniqueOrderId() {
  
    const timestamp = Date.now();
    const uniqueId = Math.random().toString(36).substring(2, 15);
    return `order_${timestamp}_${uniqueId}`;
}


//making razorpay payment function----------------------------------------------------

const generateOrderRazorpay = (orderId, total) => {
    return new Promise((resolve, reject) => {
        const options = {
            amount: total * 100,  // amount in the smallest currency unit
            currency: "INR",
            receipt: String(orderId)
        };
        instance.orders.create(options, function (err, order) {
            if (err) {
                console.log("failed");
                console.log(err);
                reject(err);
            } else {
                console.log("Order Generated RazorPAY: " + JSON.stringify(order));
                resolve(order);
            }
        });
    })
};
//----------------------------end of add money function------------------------------------


//update wallet amount---------------------------------------------------------------------
const updateMongoWallet = asyncHandler(async (req, res) => {
    try {
        const amount = parseFloat(req.body.amount); // Parse amount as a float

    //   console.log('this si the amount ;',amount);
        const userId = req.session.user;
    

        const user = await User.findByIdAndUpdate(userId, {
           $inc:{"wallet" : amount},
           $push:{
            "history":{
                amount:amount,
                status:"credit",
                timestamp:Date.now()
                
            }
           }
            
        }, { new: true });

        console.log('Updated user data:', user);

       if(user){
        res.json({status:true})

       }else{
        res.json({err:"user is not foundd"})
       }
   
    } catch (error) {
        console.log('Error happened in the wallet ctrl in the function updateMongoWallet', error);
        res.status(500).json({ message: 'An error occurred while updating the wallet', error });
    }
});


//sum wallet------------------------------------------------------------

const   sumWallet=asyncHandler(async(req,res)=>{
    try {
        const coupon= await Coupon.find()

        console.log("save wallet");
    
        const id = req.session.user
        const user = await User.findById(id)
        //   console.log(user.cart);
        const productIds = user.cart.map(cartItem => cartItem.ProductId);
        const product = await Product.find({ _id: { $in: productIds } });
        const transaction = {
            amount: user.wallet ,
            status: "debit",
            timestamp: new Date(), // You can add a timestamp to the transaction
        };
        user.wallet=0
        user.history.push(transaction);
       
        let offer = 0;
        for(let j=0; j < product.length;j++ ){
            offer+=product[j].offerPrice
           
        }
    
        // Push the transaction into the user's history array
       


        await user.save()
        let sum = req.body.sum

        res.json({balance:sum});
       
        res.render('chekOut', { user, product, sum ,coupon,offer})
        
    } catch (error) {
        console.log('Error happened in the wallet ctrl in the function sumWallet', error);
        
    }
});

//----------------------use full amount in wallet-and after that chose a paying method ----------------------------------

const sumWalletBuynow= asyncHandler(async(req,res)=>{
    try {
        const coupon= await Coupon.find()
    
        const id = req.session.user
        const user = await User.findById(id)
        const product=await Product.findById(req.query.id)
        const offer=product.offerPrice
        console.log('this is product in buynow ',product);
        const transaction = {
            amount: user.wallet ,
            status: "debit",
            timestamp: new Date(), 
        };
        user.wallet=0
        user.history.push(transaction);

        await user.save()

        let sum = req.query.sum
        console.log('this is sum>>>>',sum);
       
        res.render('buyNow', { user, product, sum ,coupon,offer})
        

        
    } catch (error) {
        console.log('Error happened in the wallet ctrl in the function sumWalletBuynow', error);
        
    }
})


const walletPayment=asyncHandler(async(req,res)=>{
    try {
       
        verifyOrderPayment(req.body)
        res.json({ status: true });
        
    } catch (error) {
        console.log('errro happemce in cart ctrl in function verifyPayment',error); 
        
    }
});


const verifyOrderPayment = (details) => {
    console.log("DETAILS : " + JSON.stringify(details));
    return new Promise((resolve, reject) => { 
        const crypto = require('crypto');
        let hmac = crypto.createHmac('sha256', process.env.RAZORPAY_SECRETKEY)
        hmac.update(details.razorpay_order_id + '|' + details.razorpay_payment_id);
        hmac = hmac.digest('hex');
        if (hmac == details.razorpay_signature) {
            console.log("Verify SUCCESS");
            resolve();
        } else {
            console.log("Verify FAILED");
            reject();
        }
    })
};






module.exports={
    addMoneyWallet,
    updateMongoWallet,
    sumWallet,
    sumWalletBuynow,
    walletPayment
   
}