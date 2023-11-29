const asyncHandler = require("express-async-handler");
const User = require('../model/userModel');
const Product = require('../model/productModel');
const Order=require('../model/orderModel');


//checkout---------------------------------------------------
const checkOut=asyncHandler(async(req,res)=>{
  try {
      const userId=req.session.user;
      const user=await User.findById(userId);
     const productId=user.cart.map(item=>item.ProductId);
      const product=await Product.find({_id:{$in:productId}});
     
      console.log('this is address ',user.address.length);
      console.log('this is address ',user.address);

      let sum = 0;
      for (let i = 0; i < user.cart.length; i++) {
          sum += user.cart[i].subTotal
      }
      sum = Math.round(sum * 100) / 100;
      res.render('checkout',{user,product,sum});


  } catch (error) {
      console.log("error in checkout function");
  }
})

//order page--------------------------------------------------------------

const orderPage = asyncHandler(async(req,res)=>{
    try{
        const userId=req.session.user;
        const user =await User.findById(userId)
        res.render('orderPage',{user})
    
    }catch(error){
        console.log('Error from order ctrl in the function orderPage',error);
    }
})


//order placed-----------------------------------------------------------------

const orderPlaced=asyncHandler(async(req,res)=>{
  try {
      // console.log(req.body);
      const {totalPrice,createdOn,date,payment,addressId}=req.body
      console.log(addressId,">>????");
      console.log("Received Amount:", totalPrice);
      const userId=req.session.user
      const user= await User.findById(userId);
      const productIds = user.cart.map(cartItem => cartItem.ProductId);

      




      const address = user.address.find(item => item._id.toString() === addressId);

    
      const producDatails= await Product.find({ _id: { $in: productIds } });

      const cartItemDetails=user.cart.map(cartItem => ({
          ProductId: cartItem.ProductId,
          quantity: cartItem.quantity,
          price: cartItem.price, // Add the price of each product
        }));

        



        const orderedProducts=producDatails.map(product=>({
          ProductId: product._id,
          price: product.price,
          title:product.title,
          image:product.images[0],
          quantity: cartItemDetails.find(item => item.ProductId.toString() === product._id.toString()).quantity,
        }));
        


        const order = new Order({
          totalPrice:totalPrice,    
          createdOn: createdOn,
          date:date,
          product:orderedProducts,
          userId:userId,
          payment:payment,
          address:address,
          status:'pending'
        })
        const orderDb= await order.save();
        console.log('this is a order',orderDb);
        for (const orderedProduct of orderedProducts) {
          const product = await Product.findById(orderedProduct.ProductId);
        
        if (product) {
          console.log('this is product',product);
          const newQuantity = product.quantity - orderedProduct.quantity;
          product.quantity = Math.max(newQuantity, 0);        
          await product.save();
      }
  }
  if(order.payment=='cod'){
    orderDb.status='conformed'
    await orderDb.save()
      console.log('yes iam the cod methord');
       res.json({ payment: true, method:"cod", order: orderDb ,qty:cartItemDetails,orderId:user});

    }

    
    
   }catch (error) {
      console.log('Error form order Ctrl in the function orderPlaced', error);
              
   }
 });


   //order details
const orderDetails=asyncHandler(async(req,res)=>{
    try {
        const orderId = req.query.orderId
        // console.log('this is order id ',orderId);
        // const  id=req.query.id.toString()
   

       const userId = req.session.user;
       const user = await User.findById(userId);
       const order = await Order.findById(orderId)

    //    console.log('thid id the odder',order);

       res.render('orderDtls', { order ,user });

    } catch (error) {
        console.log('errro happemce in cart ctrl in function orderDetails',error); 
        
    }
})



//allOrderDetails--------------------------------------------------------------------

const allOrderDetails = asyncHandler(async (req, res) => {
  try {
      const userId=req.session.user;
      const user=await User.findById(userId)
      const orders = await Order.find({ userId: userId }).sort({ createdOn: -1 });

      const itemsperpage = 10;
      const currentpage = parseInt(req.query.page) || 1;
      const startindex = (currentpage - 1) * itemsperpage;
      const endindex = startindex + itemsperpage;
      const totalpages = Math.ceil(orders.length /itemsperpage );
      // const currentproduct = orders.slice(startindex,endindex);
    
      res.render('orderList',{ orders,totalpages,currentpage ,user});
    } catch (error) {
        console.log('Error from orderCtrl in the function allOrderDetails', error);
        res.status(500).json({ status: false, error: 'Server error' });
    }
  });
  
     
//cancel order-----------------------------------------------------------------------

const cancelOrder = asyncHandler(async (req, res) => {
    try {
      const userId = req.session.user;
      const user = await User.findOne({ _id: userId }); // Use findOne to retrieve a single user document
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const orderId = req.query.orderId;
      const order = await Order.findByIdAndUpdate(orderId, {
        status: 'canceled'
      }, { new: true });


     
  



      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
  
      for (const productData of order.product) {
        const productId = productData.ProductId;
        const quantity = productData.quantity;
  
        const product = await Product.findById(productId);

      
        if (product) {
          product.quantity += quantity;
          await product.save();
        }
      }
  
      res.redirect('/allOrderDetails');
    } catch (error) {
      console.log('Error occurred in cart ctrl in function cancelOrder', error);
      
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });



  //return order-------------------------------------------------------------------------------

  const returnOrder = asyncHandler(async (req, res) => {
    try {
      const orderId = req.query.orderId;
      const userId = req.session.user;
  
   
      const user = await User.findOne({ _id: userId });
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const order = await Order.findByIdAndUpdate(orderId, {
        status: 'returned'
      }, { new: true });
  
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      user.wallet += order.totalPrice;


      const transaction = {
        amount: user.wallet ,
        status: "credit",
        timestamp: new Date(), // You can add a timestamp to the transaction
    };
    
    user.history.push(transaction);
      await user.save();
  
  
  
      for (const productData of order.product) {
        const productId = productData.ProductId;
        const quantity = productData.quantity;
  
        // Find the corresponding product in the database
        const product = await Product.findById(productId);
  
        if (product) {
          product.quantity += quantity;
          await product.save();
        }
      }
  
      res.redirect('/allOrderDetails');
    } catch (error) {
      console.log('Error occurred in returnOrder function:', error);
     
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });


  //----------------------------- admin side ---------------------------------------------//


  //admin order list


  //admin order list--------------------------------------------------------------


const adminOrderList=asyncHandler(async(req,res)=>{
  try {
    const orders=await Order.find().sort({createdOn:-1});
    const itemsperpage = 5;
    const currentpage = parseInt(req.query.page) || 1;
    const startindex = (currentpage - 1) * itemsperpage;
    const endindex = startindex + itemsperpage;
    const totalpages = Math.ceil(orders.length / itemsperpage);
    console.log("orders", orders);
    // const currentproduct = orders.slice(startindex,endindex);
    res.render('orderList',{orders,totalpages,currentpage})
  } catch (error) {
    console.log("error in adminOrderlist function",error);
  }
})


//order details admin----------------------------------------------------------

const adminOrderDetails=asyncHandler(async(req,res)=>{
  try {
    const orderId=req.query.orderId;
    const order=await Order.findById(orderId);
    const userId=order.userId;
    const user=await User.findById(userId);
    res.render('orderDetails',{user,order});
  } catch (error) {
    console.log("error in adminOrderDetails function",error);
  }
})

//status pending------------------------------------------------------------

const changeStatusPending=asyncHandler(async(req,res)=>{
  try {
    const orderId=req.query.id;
    const order=await Order.findByIdAndUpdate(orderId,{status:'pending'},{new:true});
    if(order)
    {
      res.json({status:true});
    }

  } catch (error) {
    console.log("error in changestatusPending function",error);
  }
});


//status confirmed--------------------------------------------------------------------

const changeStatusConfirmed=asyncHandler(async(req,res)=>{
  try {
    const orderId=req.query.orderId;
    const order=await Order.findByIdAndUpdate(orderId,{status:'confirmed'},{new:true});
    if(order)
    {
      res.json({status:true});
    }

  } catch (error) {
    console.log("error in changestatusPending function",error);
  }
});


//status shipped-------------------------------------------------------------------------

const changeStatusShipped=asyncHandler(async(req,res)=>{
  try {
    const orderId=req.query.orderId;
    const order=await Order.findByIdAndUpdate(orderId,{status:'shipped'},{new:true});
    if(order)
    {
      res.json({status:true});
    }

  } catch (error) {
    console.log("error in changestatusPending function",error);
  }
});

//status canceled---------------------------------------------------------------------------

const changeStatusCanceled=asyncHandler(async(req,res)=>{
  try {
    const orderId=req.query.orderId;
    const order=await Order.findByIdAndUpdate(orderId,{status:'canceled'},{new:true});
    if(order)
    {
      res.json({status:true});
    }

  } catch (error) {
    console.log("error in changestatusPending function",error);
  }
});

//status delivered--------------------------------------------------------------------------


const changeStatusDelivered=asyncHandler(async(req,res)=>{
  try {
    const orderId=req.query.orderId;
    const order=await Order.findByIdAndUpdate(orderId,{status:'delivered'},{new:true});
    if(order)
    {
      res.json({status:true});
    }

  } catch (error) {
    console.log("error in changestatusPending function",error);
  }
});

//status returned------------------------------------------------------------------------


const changeStatusReturned=asyncHandler(async(req,res)=>{
  try {
    const orderId=req.query.orderId;
    const order=await Order.findByIdAndUpdate(orderId,{status:'returned'},{new:true});
    if(order)
    {
      res.json({status:true});
    }

  } catch (error) {
    console.log("error in changestatusPending function",error);
  }
});





//---------when user click wallet use checking the cuurent sum and reduce the wallet    
const useWallet=asyncHandler(async(req,res)=>{
  try {
     
      const userId=req.session.user;
      const user=await User.findById(userId)

      if(user){
          let a=req.body
         
          let sum= a.total - a.wallet
         
         res.json({status:true,sum})
      } 
  } catch (error) {
      console.log('errro happemce in cart ctrl in function useWallet',error); 
      
  }
})











module.exports={
  checkOut,
  orderPlaced,
  orderDetails,
  orderPage,
  allOrderDetails,
  cancelOrder,
  returnOrder,
  adminOrderList,
  adminOrderDetails,
  changeStatusPending,
  changeStatusConfirmed,
  changeStatusShipped,
  changeStatusCanceled,
  changeStatusDelivered,
  changeStatusReturned,
  useWallet
  

    
}