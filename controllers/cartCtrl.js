const asyncHandler = require ('express-async-handler');
const User =require ('../model/userModel.js')
const Product =require('../model/productModel.js');


//get cart function---------------------------------------------------

const getCart = asyncHandler(async(req,res)=>{
    try {

        const userId = req.session.user;
        const user = await User.findById(userId);

        if(user){

            const productIds = user.cart.map(x=> x.ProductId);
            const product = await Product.find({_id: {$in:productIds }});
          
            
            let totalSubTotal =0;
            let quantity =0;
            
            for(const item of user.cart){
                totalSubTotal += item.subTotal;
                quantity+= item.quantity
            }

            res.render('cart',{product,cart:user.cart,quantity,totalSubTotal,user });
        }
        
    } catch (error) {
        console.log("error in getcart function",error);
        
    }
});



//add to cart ----------------------------------------------------------

const addToCart = asyncHandler(async(req,res)=>{
   
     try {
        
        const id = req.query.id;
        const user = req.session.user;
        const product = await Product.findById(id);
        const userData =await User.findById(user);

        if(userData){
            const cartItem = userData.cart.find(item => String(item.ProductId) === id);

            if(cartItem){
                const updated = await User.updateOne(
                    { _id:user,'cart.productId':id },
                    {
                        $inc: {

                            'cart.$.quantity':1,
                            'cart.$.subTotal':product.price,
                        },
                    }
                );
            }else{
                userData.cart.push({
                    ProductId: id,
                    quantity: 1,
                    total: product.price,
                    subTotal: product.price, 
                });
                const a=  await userData.save();
            }
        }

        res.json({status:true})
    } catch (error) {
        console.log('Error occurred in cart controller addToCart function', error);

     }
});


//delete cart item--------------------------------------------------------

const deleteCartItem = asyncHandler(async(req,res)=>{
    try {
        const productId = req.query.id;
        const userId = req.session.user;
        const user = await User.findById(userId);

        if(user){
            
            const itemIndex = user.cart.findIndex(item =>item.ProductId.toString()==productId); // finding index of cart item

            if(itemIndex!=-1){
                user.cart.splice(itemIndex,1);    //remove the cart item using index
                const a= await user.save();
                console.log('item has been removed from your cart',a);
                return res.json({status:true});
            }else{
                console.log('no cart item found');
                return res.json({status: false, message: 'No cart item found'});
            }
        }else{
            console.log('no user found');
            return res.json({status: false, message: 'No user found'});
        }
    } catch (error) {
        console.log("error in cart control", error);
        return res.status(500).json({status: false, message: 'Internal Server Error'});
    
     }
});


//add and subtract product count in cart--------------------------------------------

const modifyCartQuantity=asyncHandler(async(req,res)=>{
    try {
        
        const productId=req.body.productId;
       
    const userId=req.session.user;
    
    const count = req.body.count;
   


    const user=await User.findById(userId);
    
    const product=await Product.findById(productId);
    

    if(user)
    

    {
        const cartItem=user.cart.find(item=>item.ProductId==productId);
    
        if(cartItem)
    

        {
            let newQuantity;
            if(count=='1')

            {
               
                newQuantity = cartItem.quantity + 1;
            }
            else if(count=='-1')
            {
              
                newQuantity = cartItem.quantity - 1;
            }else{
    

               res.json({ status: false, error: "Invalid count" });
            }
            if (newQuantity > 0 && newQuantity <= product.quantity) {
   

                const updated = await User.updateOne(
                    { _id: userId, 'cart.ProductId': productId },
                    {
                        $set: {
                            'cart.$.quantity': newQuantity, // Update the quantity
                            'cart.$.subTotal': (product.price * newQuantity), // Update the subtotal
                        },
                    }
                );
                const updatedUser = await user.save();
                console.log("this is upsdated ",updatedUser);
                   
                    const totalAmount = product.price * newQuantity;
                   
                    res.json({ status: true, quantityInput: newQuantity, total: totalAmount });
                } else {
      

                    res.json({ status: false, error: 'out of stock' });
                }
        }
    }

    } catch (error) {
        console.error('ERROR hapence in cart ctrl in the funtion update crt',error);
        return res.status(500).json({ status: false, error: "Server error" });
    }

    

})


//delete cart------------------------------------------------------------------------

const deleteCart=asyncHandler(async(req,res)=>{
    try {  
     
   
const userId = req.session.user;
    const user = await User.findById(userId);
    
user.cart=[]
    const updatedUser = await user.save();
   console.log('this is updated user',updatedUser);
   res.json({status: true})
   
    } catch (error) {
        console.log('errro happens in cart ctrl in function deletCart',error);     
    }

})



module.exports={
    addToCart,
    getCart,
    deleteCartItem,
    modifyCartQuantity,
    deleteCart
}