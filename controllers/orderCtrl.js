const asyncHandler = require("express-async-handler");
const User = require('../model/userModel');
const Product = require('../model/productModel');
const Order=require('../model/orderModel');
const Coupon=require('../model/couponModel');
const Razorpay=require('razorpay');

var instance = new Razorpay({ key_id:process.env.RAZORPAY_KEYID, key_secret: process.env.RAZORPAY_SECRETKEY })
const ExcelJS = require('exceljs');

//checkout---------------------------------------------------
const checkOut=asyncHandler(async(req,res)=>{
  try {
      const userId=req.session.user;
      const user=await User.findById(userId);
      const coupon = await Coupon.find({
        'user.userId': { $ne: user._id }
    });
    console.log('this is coupon ',coupon);
      const productId=user.cart.map(item=>item.ProductId);
      const product=await Product.find({_id:{$in:productId}});

      let offer = 0;
      for(let j=0; j < product.length;j++ ){
          offer+=product[j].offerPrice
         
      }

      console.log('this is product offfer price',offer);

      console.log('this is product  ',product);
      console.log('this is address ',user.address.length);
      console.log('this is address ',user.address);

      let sum = 0;
      for (let i = 0; i < user.cart.length; i++) {
          sum += user.cart[i].subTotal
      }
      sum = Math.round(sum * 100) / 100;
      res.render('checkout',{user,product,sum,coupon,offer});


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
        // console.log('hhhhhhhhhhhhhhhhhhhhhhhhhhhhh');
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

    else if(order.payment=='online'){
      console.log('payment using razorpay');

       const generatedOrder = await generateOrderRazorpay(orderDb._id, orderDb.totalPrice);
       console.log('this is the error in the razorpay ',generatedOrder);
       res.json({ payment: false, method: "online", razorpayOrder: generatedOrder, order: orderDb ,orderId:user,qty:cartItemDetails});
                   
    }
    else if(order.payment=='wallet'){
      const a=   user.wallet -= totalPrice;
         const transaction = {
             amount: a,
             status: "debit",
             timestamp: new Date(), // You can add a timestamp to the transaction
         };
     
         // Push the transaction into the user's history array
         user.history.push(transaction);

       

        
          await user.save();
 
         
         res.json({ payment: true, method: "wallet", });
         
      }
    
   }catch (error) {
      console.log('Error form order Ctrl in the function orderPlaced', error);
              
   }
 });



//order details
const orderDetails=asyncHandler(async(req,res)=>{
    try {
        const orderId = req.query.orderId
        const userId = req.session.user;
       const user = await User.findById(userId);
       const order = await Order.findById(orderId)

      res.render('orderDtls', { order ,user });

    } catch (error) {
        console.log('errro happence in cart ctrl in function orderDetails',error); 
        
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
      const orderId = req.body.orderId;
      console.log(req.body.orderId)
      const userId = req.session.user;
      const returnReason = req.body.returnReason;
      console.log(returnReason);
      const user = await User.findOne({ _id: userId });
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
     
      const rorder = await Order.findOne({_id:orderId})
      console.log(rorder);
      const order = await Order.findByIdAndUpdate(orderId, {
        status: 'returnrequested', returnreason:returnReason
      }, { new: true });
      console.log('order');
      console.log(rorder);
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
  
      // res.redirect('/allOrderDetails');
      return res.json({status:true});
    } catch (error) {
      console.log('Error occurred in returnOrder function:', error);
     
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });


  //----------------------------- admin side ---------------------------------------------//


  


  //admin order list-------------------------------------------------------------->


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

//change status reject return------------------------------------------------------------

const changeStatusReturnRejected=asyncHandler(async(req,res)=>{
  try {
    const orderId=req.query.orderId;
    const order=await Order.findByIdAndUpdate(orderId,{status:'returnreject'},{new:true});
    if(order)
    {
      res.json({status:true});
    }

  } catch (error) {
    console.log("error in changestatusPending function",error);
  }
});

//generate razorpay------------------------------------------------------------------------

const generateOrderRazorpay = (orderId, total) => {


  return new Promise((resolve, reject) => {
    
      const options = {
          amount: total * 100,  // amount in the smallest currency unit
          currency: "INR",
          receipt: String(orderId)
      };
      instance.orders.create(options, function (err, order) {
          if (err) {
              console.log("failed",err);
              console.log(err);
              reject(err);
          } else {
              console.log("Order Generated RazorPAY: " + JSON.stringify(order));
              resolve(order);
          }
      });
  })
}


//razorpay payment ----------------------------------------------------------------------

const verifyPayment=asyncHandler(async(req,res)=>{
  try {

    console.log(req.body,"this is req.body");
    const ordr=req.body.order
     const order=await Order.findByIdAndUpdate(ordr._id,{
      status:"conformed"
     })
     
     console.log('this is ther comformed order  data',order);
      verifyOrderPayment(req.body)
      res.json({ status: true });
      
  } catch (error) {
      console.log('errro happemce in order ctrl in function verifyPayment',error); 
      
  }
});



//verify the payment razorpay ----------------------------------------------------------------------

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

//----------sales report page --------------------------------->
const loadsalesReport=asyncHandler(async(req,res)=>{
  try {

      const orders= await Order.find({status:'delivered'})

    
      const itemsperpage = 3;
      const currentpage = parseInt(req.query.page) || 1;
      const startindex = (currentpage - 1) * itemsperpage;
      const endindex = startindex + itemsperpage;
      const totalpages = Math.ceil(orders.length / 3);
      const currentproduct = orders.slice(startindex,endindex);

 res.render('salesReport',{orders:currentproduct,totalpages,currentpage})


      
  } catch (error) {
      console.log('errro happens in cart ctrl in function loadsalesReport',error); 
      
  }
});

//-----sortinhg the sales report ------------------------------------>

const salesReport = asyncHandler(async (req, res) => {
  try {
      const date = req.query.date;
      const format = req.query.format;
      let orders;
      const currentDate = new Date();

      // Helper function to get the first day of the current month
      function getFirstDayOfMonth(date) {
          return new Date(date.getFullYear(), date.getMonth(), 1);
      }

      // Helper function to get the first day of the current year
      function getFirstDayOfYear(date) {
          return new Date(date.getFullYear(), 0, 1);
      }

      switch (date) {
          case 'today':
              orders = await Order.find({
                  status: 'delivered',
                  createdOn: {
                      $gte: new Date().setHours(0, 0, 0, 0), // Start of today
                      $lt: new Date().setHours(23, 59, 59, 999), // End of today
                  },
              });
              break;
           case 'week':
              const startOfWeek = new Date(currentDate);
              startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); // Set to the first day of the week (Sunday)
              startOfWeek.setHours(0, 0, 0, 0);

              const endOfWeek = new Date(startOfWeek);
              endOfWeek.setDate(startOfWeek.getDate() + 6); // Set to the last day of the week (Saturday)
              endOfWeek.setHours(23, 59, 59, 999);

              orders = await Order.find({
                  status: 'delivered',
                  createdOn: {
                      $gte: startOfWeek,
                      $lt: endOfWeek,
                  },
              });
              break;
          case 'month':
              const startOfMonth = getFirstDayOfMonth(currentDate);
              const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);

              orders = await Order.find({
                  status: 'delivered',
                  createdOn: {
                      $gte: startOfMonth,
                      $lt: endOfMonth,
                  },
              });
              break;
          case 'year':
              const startOfYear = getFirstDayOfYear(currentDate);
              const endOfYear = new Date(currentDate.getFullYear(), 11, 31, 23, 59, 59, 999);

              orders = await Order.find({
                  status: 'delivered',
                  createdOn: {
                      $gte: startOfYear,
                      $lt: endOfYear,
                  },
              });
             
              break;
          default:
              // Fetch all orders
              orders = await Order.find({ status: 'delivered' });
      }
      if (format === 'excel') {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sales Report');

        worksheet.columns = [
          { header: 'Order ID', key: 'id', width: 30 },
          { header: 'Product name', key: 'name', width: 30 },
          { header: 'Price', key: 'price', width: 15 },
          { header: 'Status', key: 'status', width: 20 },
          { header: 'Date', key: 'date', width: 15 }
         
      ];
      orders.forEach(order => {
        order.product.forEach(product => {
            worksheet.addRow({
                id: order._id,
                name: product.title,
                price: order.totalPrice,
                status: order.status,
                date: order.createdOn.toLocaleDateString()
                // ... (Fill other columns as necessary)
            });
        });
    });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=sales-report.xlsx');
    await workbook.xlsx.write(res);
    return res.end();
  }else{

    const itemsperpage = 3;
      const currentpage = parseInt(req.query.page) || 1;
      const startindex = (currentpage - 1) * itemsperpage;
      const endindex = startindex + itemsperpage;
      const totalpages = Math.ceil(orders.length / 3);
      const currentproduct = orders.slice(startindex,endindex);

 res.render('salesReport',{orders:currentproduct,totalpages,currentpage})
    

  }


      
  } catch (error) {
      console.log('Error occurred in salesReport route:', error);
      // Handle errors and send an appropriate response
      res.status(500).json({ error: 'An error occurred' });
  }
});

//load cancel report-------------------------------

const loadcancelReport=asyncHandler(async(req,res)=>{
  try {
    

      const orders= await Order.find({status:'canceled'})
      
    
      const itemsperpage = 3;
      const currentpage = parseInt(req.query.page) || 1;
      const startindex = (currentpage - 1) * itemsperpage;
      const endindex = startindex + itemsperpage;
      const totalpages = Math.ceil(orders.length / 3);
      const currentproduct = orders.slice(startindex,endindex);

 res.render('cancelReport',{orders:currentproduct,totalpages,currentpage})


      
  } catch (error) {
      console.log('errro happens in cart ctrl in function loadcancelReport',error); 
      
  }
});
//sorting of cancel report-----------------------------------
const getCancelledOrders = async (req, res) => { 
  try { 
    console.log('enterd to cancel product!!!!!!');
  const date = req.query.date;
  let format = req.query.format || 'json'; 
  let cancelledOrders; 
  const orders= await Order.find({status:'canceled'})
  const currentDate = new Date(); 
  
        // Helper function to get the first day of the current month
        function getFirstDayOfMonth(date) {
            return new Date(date.getFullYear(), date.getMonth(), 1);
        }
  
        // Helper function to get the first day of the current year
        function getFirstDayOfYear(date) {
            return new Date(date.getFullYear(), 0, 1);
        }
  
  const range = req.query.range || 'all'
    switch (date) {
        case 'today':
            cancelledOrders = await Order.find({
               status: 'canceled',
               createdOn: {
                    $gte: currentDate.setHours(0, 0, 0, 0),
                    $lt: currentDate.setHours(23, 59, 59, 999),
               },
            });
            break;
        case 'week':
            const startOfWeek = new Date(currentDate);
            startOfWeek.setDate(currentDate.getDate()-currentDate.getDay())
            startOfWeek.setHours(0, 0, 0, 0);
  
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6); // Set to the last day of the week (Saturday)
            endOfWeek.setHours(23, 59, 59, 999);
  
            cancelledOrders = await Order.find({
               status: 'canceled',
               createdOn: {
                    $gte: startOfWeek,
                    $lt: endOfWeek,
               },
            });
            break;
        case 'month':
            const startOfMonth = getFirstDayOfMonth(currentDate);
            const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);
  
            cancelledOrders = await Order.find({
               status: 'canceled',
               createdOn: {
                    $gte: startOfMonth,
                    $lt: endOfMonth,
               },
            });
            break;
        case 'year':
            const startOfYear = getFirstDayOfYear(currentDate);
            const endOfYear = new Date(currentDate.getFullYear(), 11, 31, 23, 59, 59, 999);
  
            cancelledOrders = await Order.find({
               status: 'canceled',
               createdOn: {
                    $gte: startOfYear,
                    $lt: endOfYear,
               },
            });
           
            break;
        default:
            // Fetch all orders
            cancelledOrders = await Order.find({ status: 'canceled' });
    }
    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Canceled Orders Report');
  
      worksheet.columns = [
        { header: 'Order ID', key: 'id', width: 30 },
        { header: 'Product name', key: 'name', width: 30 },
        { header: 'Price', key: 'price', width: 15 },
        { header: 'Status', key: 'status', width: 20 },
        { header: 'Date', key: 'date', width: 15 }
       
    ];
    cancelledOrders.forEach(order => {
      order.product.forEach(product => {
          worksheet.addRow({
              id: order._id,
              name: product.title,
              price: order.totalPrice,
              status: order.status,
              date: order.createdOn.toLocaleDateString()
              // ... (Fill other columns as necessary)
          });
      });
  });
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=cancelled-orders-report.xlsx');
  await workbook.xlsx.write(res);
  return res.end();
  }else{
    
  const itemsperpage = 3;
   const currentpage = parseInt(req.query.page) || 1;
    const startindex = (currentpage - 1) * itemsperpage
    const currentproduct = cancelledOrders.slice(startindex,startindex + itemsperpage);
    const totalpages = Math.ceil(cancelledOrders.length / itemsperpage);
   res.render('cancelReport',{orders:currentproduct,totalpages,currentpage})
      
  
    }
  
  
        
    } catch (error) {
        console.log('Error occurred in cancelReport route:', error);
        // Handle errors and send an appropriate response
        res.status(500).json({ error: 'An error occurred' });
    }
  };

  
  //stock report-----------------------------------------------
  const loadStockReport = asyncHandler(async (req, res) => {
    try {
      const limit=8; // Number of products per page
      const page=req.query.page ? parseInt(req.query.page) : 1;  // Current page number
      console.log(page);
      const product = await Product.find()
          .skip((page - 1) * limit)  // Skip the results from previous pages
          .limit(limit);  // Limit the number of results to "limit"

      const totalProduct = await Product.countDocuments();
      const totalPages = Math.ceil(totalProduct / limit);

      res.render('stockReport',{product,page,totalPages,limit});
  } catch (error) {

      console.log("all products view error",error);
      
  }
  });
  
  module.exports = loadStockReport;
  
//buynow------------------------------------------------------------>
const buyNOw=asyncHandler(async(req,res)=>{
  try {
      const product= await Product.findById(req.query.id)


      if(product.quantity >=1 ){
        

          const id = req.session.user
          const user = await User.findById(id)
          const coupon = await Coupon.find({
              'user.userId': { $ne: user._id }
          });
          
         
          
         let sum= product.price 
          res.render('buyNow', { user, product, sum ,coupon})

      }else{
          res.redirect(`/aProduct?id=${product._id}`)
      }
     



  } catch (error) {
      console.log('Error occurred in orderCTrl buyNOw:', error);
      
  }

})
//buy now place order--------------------------------------------------------------------

const buynowPlaceOrder=asyncHandler(async(req,res)=>{
  try {
      
      const {totalPrice,createdOn,date,payment,addressId,prId}=req.body
      const userId=req.session.user
      const user= await User.findById(userId);
     
     const address = user.address.find(item => item._id.toString() === addressId);

     const productDetail = await Product.findById(prId);

     
    const productDetails={
      ProductId:productDetail._id,
      price:productDetail.price,
      title:productDetail.title,
      image:productDetail.images[0],
      quantity:1


    }
     
      const oder = new Order({
          totalPrice:totalPrice,    
          createdOn: createdOn,
          date:date,
          product:productDetails,
          userId:userId,
          payment:payment,
          address:address,
          status:'conformed'
  
      })
       const oderDb = await oder.save()
       //-----------part that decrese the qunatity od the cutent product --
       productDetails.quantity= productDetails.quantity-1      
       await productDetail.save();
          
      
       //-------------------------------  
       
       if(oder.payment=='cod'){
         console.log('using cod method');
          res.json({ payment: true, method: "cod", order: oderDb ,qty:1,oderId:user});

       }else if(oder.payment=='online'){
         console.log('usingrazorpay method');

          const generatedOrder = await generateOrderRazorpay(oderDb._id, oderDb.totalPrice);
          res.json({ payment: false, method: "online", razorpayOrder: generatedOrder, order: oderDb ,oderId:user,qty:1});
                      
       }else if(oder.payment=='wallet'){
       const a =   user.wallet -= totalPrice;
          const transaction = {
              amount: a,
              status: "debit",
              timestamp: new Date(), // You can add a timestamp to the transaction
          };
      
          // Push the transaction into the user's history array
          user.history.push(transaction);

        

         
           await user.save();
  
          
          res.json({ payment: true, method: "wallet", });
          
       }




  } catch (error) {
      console.log('Error form oder Ctrl in the function buy now ', error);
      
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
  changeStatusReturnRejected,
  useWallet,
  loadsalesReport,
  salesReport,
  loadcancelReport,
  loadStockReport,
  getCancelledOrders,
  verifyPayment,
  buyNOw,
  buynowPlaceOrder

    
}