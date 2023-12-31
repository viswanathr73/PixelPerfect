const asyncHandler=require('express-async-handler')
const User=require('../model/userModel')

const blogpage= asyncHandler(async(req,res)=>{
    try {
        const userId=req.session.user
        const user=await User.findById(userId)
        res.render('blog',{user})
        
    } catch (error) {
        console.log('Error Happence in the  blogCtrl in;; the funtion blogpage',error);
    }
})



module.exports={
    blogpage
}