const User = require("../model/userModel");
const asyncHandler=require("express-async-handler");
const Product = require("../model/productModel");
const categoryModel = require("../model/categoryModel");
const nodemailer=require("nodemailer");


//load index-----------------------------------------------
const loadIndex = asyncHandler(async (req, res) => {
    try {
        const userId = req.session.user;
        const product = await Product.find({isDeleted:false,status:true});
        
const user= await User.findById(userId)


const category=await categoryModel.find({status:false})

res.render("index", { user, product });

  
} catch (error) {
    console.log("Error happens in userController loadIndex function:", error);
}
});


//user login-----------------------------------------------

const loginUser = async(req,res)=>{
    try{
        res.render('login',{message:""});
    } catch(error) {
        console.log("login user error");
    }
}

//user register-----------------------------------------------

const registerUser=async(req,res)=>{
    try{
        res.render('registration');
    } catch(error){
        console.log(error.message);
    }
}

// const loadHome = async(req,res)=>{
//     try {
//         res.render('index',{user: req.session.user})
//     } catch (error) {
//        console.log(error.message); 
//     }
// }

function generateotp(){

    var digits='1234567890';
    var otp=""
    for(let i=0;i<6;i++){
        otp+=digits[Math.floor(Math.random()*10)];
    }
    return otp;
}

// email-otp verification------------------------------------------------------------

const createUser=asyncHandler(async(req,res)=>{
    try {
     const email=req.body.email;
     console.log("+++++++++++++++++++++++++++++++++++++=",req.body);
     const findUser=await User.findOne({email:email});
     if(!findUser){
         //create a new user
        const otp=generateotp();
        console.log("----------------------------------------",otp);
        const transporter=nodemailer.createTransport({
         service:"gmail",
         port:587,
         secure:false,
         requireTLS:true,
         auth:{
             user:process.env.AUTH_MAIL,
             pass:process.env.AUTH_PASS
         },
        });
        const info=await transporter.sendMail({
         from:process.env.AUTH_MAIL,
         to:email,
         subject:"Verify Your Account",
         text:`your OTP is :${otp}`,
         html:`<b> <h4> Your OTP ${otp}</h4>  <br> <a href="/user/emailOTP/">Click here</a></b>`,
        });
        if(info){
         req.session.userOTP=otp;
         console.log("this is the session otp",req.session.userOTP);
 
         req.session.userData=req.body;
         console.log('iama here at session');
        //  console.log('this is user data',req.session.userData);
        //  console.log('this is req.body  data',req.session.userData);
 
 
         res.render("emailOtp",{email:req.body.email})
         console.log("Message sent: %s",info.messageId);
        } 
        else{
         res.json("email error")
        }   
     }
     else{
         //user already exist
         res.render('registration',{errMessage:'User already exist',message:''});
 
     }
    } catch (error) {
     console.log(error.message);
     
    }
});
 
 
 const resendOtp = asyncHandler(async(req, res) => {
     try {
        console.log("resend otp=======================");
         const email = req.body.email;
         const findUser = await User.findOne({ email: email });
 
         if (!findUser) {
             const otp = generateotp();
             const transporter = nodemailer.createTransport({
                 service: "gmail",
                 port: 587,
                 secure: false,
                 requireTLS: true,
                 auth: {
                     user: process.env.AUTH_MAIL,
                     pass: process.env.AUTH_PASS
                 },
             });
 
             const info = await transporter.sendMail({
                 from: process.env.AUTH_MAIL,
                 to: email,
                 subject: "Resend Verification OTP",
                 text: `Your OTP is :${otp}`,
                 html: `<b><h4>Your OTP is ${otp}</h4><br><a href="/user/emailOTP/">Click here</a></b>`,
             });
 
             if (info) {
                 req.session.userOTP = otp;
                
                 res.json({ success: true, message: "Email " });
             } else {
                 res.json({ success: false, message: "Email error" });
             }
 
            } else {
             res.json({ success: false, message: "Email is already verified." });
         }
     } catch (error) {
         console.log("error in resend otp function", error);
     }
});


//user login verification-------------------------------------------------------------


const verifyUser = asyncHandler(async (req, res) => {
    try {
        const { email, password} = req.body;
        const findUser = await User.findOne({ email });
        console.log(findUser.isBlocked);
        if(findUser.isBlocked){
            res.render("login",{message:'Your Account has been Blocked'})
        }
        if (findUser && (await findUser.isPasswordMatched(password))) {
            req.session.user = findUser._id;
            console.log('Successful login');
            res.redirect("/");
        } else {
            //req.flash("error", "Incorrect email or password"); // Flash an error message
            console.log('Error in login user');
            res.render("login",{ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.log("Error happens in userController userLogin function:", error);
    }
});



//user otp checking--------------------------------------------------------------------

const emailVerified=async(req,res)=>{
    try {
       
        console.log("req.body of email: ::::");
        console.log(req.body.otp);
        const enteredOTP=req.body.otp
        console.log('this is the entered otp:',enteredOTP);
        console.log("this is the session otp:",req.session.userOTP);
        if(enteredOTP===req.session.userOTP){
            // console.log('userdata in session');
            // console.log(req.session.userData);
            const user=req.session.userData
            console.log("this is the user data");
            console.log(user);
            const saveUserData=new User({

                username:user.username,
                email:user.email,
                mobile:user.mobile,
                password:user.password,
            });
            const users=await saveUserData.save();
            console.log('data ssaveed');
            req.session.user=users._id
            console.log('this is saved user data>>>>>>>>>>>',users);

            res.redirect('/login')
        }else{
            console.log('hello this is ios error');
            res.render('emailOtp')

        }
    } catch (error) {
        console.log('user email verification error',error);
        
    }

}
//logout
const logout = asyncHandler(async (req, res) => {
try {
    req.session.destroy(err => {
        if (err) throw err;
        res.redirect('/');
    });
} catch (error) {
    console.error("Error during logout:", error);
    res.status(500).send('Internal Server Error');
}
});



module.exports={
    loginUser,
    registerUser,
    createUser,
    verifyUser,
    emailVerified,
    resendOtp,
    //loadHome,
     loadIndex,
    logout,
}