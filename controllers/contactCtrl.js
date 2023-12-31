const asyncHandler=require('express-async-handler')
const User=require('../model/userModel')

const contactpage= asyncHandler(async(req,res)=>{
    try {
        const userId=req.session.user
        const user=await User.findById(userId)
        res.render('contact',{user})
        
    } catch (error) {
        console.log('Error Happence in the contactCtrl in;; the funtion contact page',error);
    }
})



module.exports={
    contactpage
}