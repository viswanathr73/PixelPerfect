const asyncHandler = require('express-async-handler');
const Product = require('../model/productModel');
const category =require ('../model/categoryModel');
const User = require ('../model/userModel') 



//search in header by category----------------------------------------

const filterSearch=asyncHandler(async(req,res)=>{
    try {
        const userId=req.session.user;
      const user=await User.findById(userId)

        const product=await Product.find({isDeleted:false,
            $or:[
            {category:{$regex:`${req.body.search}`,$options:'i'}},
            { title:{ $regex:`${req.body.search}` , $options: 'i' } }
            ]
        });

        console.log("-----------------------",product);
        console.log("---------------------",product.length);
        let cat;
        if(product.length >0){
             cat=product[0].category
             const itemsperpage = 8;
             const currentpage = parseInt(req.query.page) || 1;
             const startindex = (currentpage - 1) * itemsperpage;
             const endindex = startindex + itemsperpage;
             const totalpages = Math.ceil(product.length / 8);
             const currentproduct = product.slice(startindex,endindex);
     
             
     
             res.render('filter',{product:currentproduct, totalpages,currentpage,cat,user})


        }else{
            const products=[]
            cat=""
            const itemsperpage = 8;
            const currentpage = parseInt(req.query.page) || 1;
            const startindex = (currentpage - 1) * itemsperpage;
            const endindex = startindex + itemsperpage;
            const totalpages = Math.ceil(products.length / 8);
            const currentproduct = products.slice(startindex,endindex);
            console.log("---------------------------------",currentpage);
    
            
    
            res.render('filter',{product:currentproduct, totalpages,currentpage,cat})
        }
       
        
       
        
    } catch (error) {
        console.log('Error happent in filter controller in filterSearch funttion',error);
    }
})


//filter by price-----------------------------------------------------------------------

const priceFilter=asyncHandler(async(req,res)=>{  
    try {
        const userId=req.session.user;
        const user=await User.findById(userId)
        const price = req.query.price;
        const cat= req.query.cat
        const maxPrice = req.query.maxPrice;
        const product = await Product.find({ $and: [{ price: { $gte: price } }, { price: { $lte: maxPrice } },{category:cat}] });
        
        const itemsperpage = 8;
        const currentpage = parseInt(req.query.page) || 1;
        const startindex = (currentpage - 1) * itemsperpage;
        const endindex = startindex + itemsperpage;
        const totalpages = Math.ceil(product.length / 8);
        const currentproduct = product.slice(startindex,endindex);
        res.render('filter',{product:currentproduct, totalpages,currentpage,cat,user})

        
    } catch (error) {
        console.log('Error happent in filter controller in pricefilter funttion',error);
        
    }
});


//brand filter-----------------------------------------------------------------------------

const brandFilter=asyncHandler(async(req,res)=>{
    try {
        const userId=req.session.user;
        const user=await User.findById(userId)
        const brand=req.query.brand;
        const cat = req.query.cat
        console.log(cat,"this is cat");
        const product=await Product.find({$and:[{brand:brand},{category:cat}]})
        const itemsperpage = 8;
        const currentpage = parseInt(req.query.page) || 1;
        const startindex = (currentpage - 1) * itemsperpage;
        const endindex = startindex + itemsperpage;
        const totalpages = Math.ceil(product.length / 8);
        const currentproduct = product.slice(startindex,endindex);
        res.render('filter',{product:currentproduct, totalpages,currentpage,cat,user})

        
    } catch (error) {
        console.log('Error happent in filter controller in brandfilter funttion',error);
        
    }
})


//category filter--------------------------------------------------------------------------
const CategoryFilter=asyncHandler(async(req,res)=>{
    try {
        const userId=req.session.user;
        const user=await User.findById(userId)
        const category=req.query.category
        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.",category)
        console.log("catergory")
        console.log(category)
        const product=await Product.find({category:category})
        console.log("------------------------------------",product);
        const cat=category
        const itemsperpage = 8;
        const currentpage = parseInt(req.query.page) || 1;
        const startindex = (currentpage - 1) * itemsperpage;
        const endindex = startindex + itemsperpage;
        const totalpages = Math.ceil(product.length / 8);
        const currentproduct = product.slice(startindex,endindex);
        res.render('filter',{product:currentproduct, totalpages,currentpage,cat,user})


    } catch (error) {
        console.log('Error happent in filter controller in CategoryFilter funttion',error);
        
    }
})


//--------------clear the fi;lter and show all the data-------------------
const clearFilter = asyncHandler(async(req,res)=>{
    try {
        const userId=req.session.user;
        const user=await User.findById(userId)
       const product=await Product.find()
       const cat =''
       const itemsperpage = 8;
       const currentpage = parseInt(req.query.page) || 1;
       const startindex = (currentpage - 1) * itemsperpage;
       const endindex = startindex + itemsperpage;
       const totalpages = Math.ceil(product.length / 8);
       const currentproduct = product.slice(startindex,endindex);
       res.render('filter',{product:currentproduct, totalpages,currentpage,cat,user})
   
       
       
    } catch (error) {
       console.log('Error happent in filter controller in clearFilter funttion',error);
       
    }
   })
   
   //---------------------sort by price-------------
const sortByPrice=asyncHandler(async(req,res)=>{

 
    try {
        const userId=req.session.user;
        const user=await User.findById(userId)
        const cat= req.query.cat
      const sort = req.query.sort;
      console.log(sort,">>>>>>>>>");
      let sortOrder
    if(sort=="lowToHigh"){
        sortOrder= 1
    }else{
        sortOrder=-1
    }
   
      console.log(sortOrder,">>>>>>>>>");
  
      let product = await Product.find({category:cat}).sort({ price: sortOrder });
      console.log(sortOrder,">>>>>>>>>");

      const itemsperpage = 8;
      const currentpage = parseInt(req.query.page) || 1;
      const startindex = (currentpage - 1) * itemsperpage;
      const endindex = startindex + itemsperpage;
      const totalpages = Math.ceil(product.length / 8);
      const currentproduct = product.slice(startindex,endindex);
     
  
      res.render('filter', { product: currentproduct, totalpages, currentpage,cat,user});
    } catch (error) {
      console.log('Error happened in filter controller in sortByPrice function', error);
    }
  });
   
  //product search in header-----------------------------------------------------------------


const productSearch=asyncHandler(async(req,res)=>{
    try {
        const userId=req.session.user;
        const user=await User.findById(userId)

       console.log(req.body);

        const product=await Product.find({
            title:{$regex:`${req.body.search}`,$options:'i'}
        })
        
        const itemsperpage = 6;
        const currentpage = parseInt(req.query.page) || 1;
        const startindex = (currentpage - 1) * itemsperpage;
        const endindex = startindex + itemsperpage;
        const totalpages = Math.ceil(product.length / 6);
        const currentproduct = product.slice(startindex,endindex);

        

        res.render('filter',{product:currentproduct, totalpages,currentpage,user})
        
    } catch (error) {
        console.log('Error happent in filter controller in ProductSearch funttion',error);
    }
})



module.exports={productSearch, 
    CategoryFilter,
    filterSearch,
    priceFilter,
    brandFilter,
    clearFilter,
    sortByPrice


}