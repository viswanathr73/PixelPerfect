const asyncHandler = require('express-async-handler')
const User = require('../model/userModel')


//admin login-----------------------------------------------------------------

const loginAdmin = asyncHandler(async(req,res)=>{
    try {
        res.render('login')
    } catch (error) {
        console.log("login admin error",error);
    }
})


const adminDashboard = asyncHandler(async(req,res)=>{
    try {
        res.render('dashboard')
    } catch (error) {
        console.log('Error happened at admin dashboard',error);
        
    }
})

//admin verification----------------------------------------------------------------

const adminVerifyLogin=asyncHandler(async(req,res)=>{
    try {
        const {email, password}=req.body;
        console.log("-----------------------------------",email);

        const findAdmin=await User.findOne({email, isAdmin:'1'});
        // console.log('admin data:',findAdmin);
        if(findAdmin && await findAdmin.isPasswordMatched(password)){
            req.session.Admin=true;
            res.render('dashboard')
        }
        else{
            res.redirect('/admin/login');
        }

    } catch (error) {
        console.log(" thi is adminVerify error",error);
        
    }
});


// user page rendering and show details of all users--------------------------------------

const userField = asyncHandler(async(req,res)=>{
    try{
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) ||4;
        // Calculate the skip value to detemine
        const skip = (page - 1) *limit;
       
        const user = await User.find({isAdmin:{$ne:1}})
        .skip(skip)
        .limit(limit);
        //Get the total number of products in the database

        const totalProductsCount = await User.countDocuments();

        //Calculate the total number of pages based on the total products and limit
        const totalPages = Math.ceil(totalProductsCount / limit);
        res.render('users',{users:user,page,totalPages,limit});
        if(blockUser){
            res.redirect('/admin/user');
        }
        } catch (error){
            console.log("user field error in dashboard",error);

        
         } }
)

//block user-----------------------------------------------------------

const blockUser = asyncHandler(async(req,res)=>{
    try {
        const id = req.query.id;
        const blockUser = await User.findByIdAndUpdate(id,{isBlocked:true},{new:true});
        if(blockUser)
        {
            res.redirect('/admin/users');
        }
    } catch (error) {
        console.log("block user error");
    }
})

//unblock user-------------------------------------------------------------------------

const unblockUser = asyncHandler(async(req,res)=>{
    try {
        const id = req.query.id;
        const unblockedUser = await User.findByIdAndUpdate(id,{isBlocked:false},{new:true});
        if(unblockedUser)
        {
            res.redirect('/admin/users');
        }
    } catch (error) {
        console.log("unlock user error", error);
    }
})
//logout admin------------------------------------------------------------------

const logout = asyncHandler(async(req,res)=>{
    try{
        req.session.Admin = null;
        res.redirect('/admin/login')
    } catch (error) {
        console.log('Error hapens in admin controller at logout function',error);

    }
})


module.exports={
    adminDashboard,
    loginAdmin,
    adminVerifyLogin,
    userField,
    blockUser,
    unblockUser,
    logout
}