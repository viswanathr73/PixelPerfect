const asyncHandler=require('express-async-handler')

const isAdminAuth=asyncHandler(async(req,res,next)=>{
    try {
        if(req.session.Admin){
            next()
        }else{
            res.redirect('/admin/login')
        }
    } catch (error) {
        console.log('error happends in is Admin auth middleware',error);
        
    }
})


const isLoggedout=asyncHandler(async(req,res,next)=>{
    try {
        if(!req.session.Admin){
            next()
        }else{
            res.redirect('/admin/dashboard')
        }
    } catch (error) {
        console.log('error happends in is Admin auth middleware',error);
        
    }
})

module.exports={
    isAdminAuth,
    isLoggedout
}