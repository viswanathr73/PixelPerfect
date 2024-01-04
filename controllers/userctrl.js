const User = require("../model/userModel");
const asyncHandler=require("express-async-handler");
const Product = require("../model/productModel");
const categoryModel = require("../model/categoryModel");
const nodemailer=require("nodemailer");
const Order = require("../model/orderModel");
const bcrypt =require('bcryptjs')
const Banner=require('../model/bannerModel')
const generateHashedPassword = async (password) => {
    const saltRounds = 10; // Number of salt rounds
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  };

//load index-----------------------------------------------
const loadIndex = asyncHandler(async (req, res) => {
    try {
        const userId = req.session.user;
        const product = await Product.find({isDeleted:false,status:true});
        
const user= await User.findById(userId)
const banner= await Banner.find();

const category=await categoryModel.find({status:false})

res.render("index", { user, product,banner});

  
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

const emailForgot =asyncHandler(async(req,res)=>{
    try {
       
        res.render('forgotOTP')
    } catch (error) {
        
    }
})

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
     console.log("+++++++++++++++++++++++++++++++++++=",req.body);
     const findUser=await User.findOne({email:email});
     if(!findUser){
         //create a new user
        const otp=generateotp();
        console.log("--------------------------------------",otp);
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
            console.log('hello this is  error');
            res.render('emailOtp')

        }
    } catch (error) {
        console.log('user email verification error',error);
        
    }

}
//logout---------------------------------------------------------------
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


//forgot password----------------------------------------------------------------

const forgotPsdPage = asyncHandler(async (req, res) => {
    try {
        res.render("forgotPassword");
    } catch (error) {
        console.log(
            "Error happents in userControler forgotPsdPage  function :",
            error
        );
    }
});

//check email is valid in forgot password-------------------------------------------

const forgotEmailValid = asyncHandler(async (req, res) => {
    try {
        const { email } = req.body;
        const findUser = await User.findOne({ email:email });
        console.log(findUser,"thie is user");
        if (findUser) {
            
            const otp = generateotp();
            console.log(otp);
            const transporter = nodemailer.createTransport({
                service: "gmail",
                port: 587,
                secure: false,
                requireTLS: true,
                auth: {
                    user: process.env.AUTH_MAIL,
                    pass: process.env.AUTH_PASS,
                },
            });
            console.log(transporter);
            const info = await transporter.sendMail({
                from: process.env.AUTH_MAIL,
                to: email,
                subject: "Verify Your Account  ✔",
                text: `Your OTP is : ${otp}`,
                html: `<b>  <h4 >Your OTP  ${otp}</h4>    <br>  <a href="/api/user/emailOTP/">Click here</a></b>`,
            });
            if (info) {
                console.log(info,"this is info");
                req.session.forgotOTP = otp;
                req.session.forgotEmail = req.body.email;
                console.log(req.session.forgotEmail);
               
               
               res.redirect('/emailForgot')
               

            } else {
                res.json("email error");
            }
        } else {
          
            res.redirect("/api/user/forgotPassword");
        }
    } catch (error) {
        console.log(
            "Error happens in userControler forgotEmailValid function:",
            error
        );
    }
});




//forgotPasswordsdOTP--------------------------------------------------------------------

const forgotPsdOTP = asyncHandler(async (req, res) => {
    try {
         const enteredOTP = req.body.otp
        console.log("otp entered by user :", enteredOTP);
        if (enteredOTP === req.session.forgotOTP) {
            res.render("resetPassword");
        } else {
            console.log("error in otp ");
        }
    } catch (error) {
        console.log(
            "Error hapents in userControler forgotPsdOTP  function :",
            error
        );
    }
});



//updatePassword----------------------------------------------------


const updatePassword = asyncHandler(async (req, res) => {
    try {
        const email = req.session.forgotEmail;
        const user = await User.findOne({ email });
        if (user) {
            const hashedPassword = await generateHashedPassword(req.body.password);
            const updateUser = await User.findByIdAndUpdate(
                user._id,
                {
                    password: hashedPassword,
                },
                { new: true }
            );


            res.redirect("/");
        }
    } catch (error) {
        console.log(
            "Error hapents in userControler updatePassword  function :",
            error
        );
    }
});




//user profile creation-----------------------------------------------------


const userProfile=asyncHandler(async(req,res)=>{
    try {
        const userId=req.session.user;
        const user=await User.findById(userId);
        const orders = await Order.find({ userId: userId }).sort({ createdOn: -1 });

        console.log(user);
        res.render('userProfile',{user,orders});
        
    } catch (error) {
        console.log("user controller userProfile error",error);
    }



})





//edit profile--------------------------------------------------------------------

const editProfile = asyncHandler(async(req,res)=>{
      try {
        const userId = req.query.id;
        const user = await User.findById(userId);

        res.render('editProfile',{user});
        console.log(user);

      } catch (error) {
        console.log("error in user editProfile function");
      }
});


 //update user profile--------------------------------------------------------

const updateProfile=asyncHandler(async(req,res)=>{
    try {
        const {id,username,email,mobile}=req.body;
        const user=await User.findById(id);
        const similarUser=await User.find({$and:
            [{_id:{$ne:user._id}},
                {$or:[{username},{email}]}
            ]});

        if(similarUser.length==0)
        {
            user.username=username;
            user.email=email;
            user.mobile=mobile;
            await user.save();
            res.redirect('/profile');
        }    
        else{
            console.log("user already exist");
        }

    } catch (error) {
        console.log("error in upadate user function",error);
    }
});

//add user profile picture--------------------------------------------------------------
const addProfilePic = asyncHandler(async (req, res) => {
    try {
        const { id } = req.body;
        console.log(id);

        // Validate the existence of id and file.
        if (!id || !req.file) {
            return res.status(400).send({ message: 'ID or file is missing.' });
        }

        const image = req.file.filename;
        const user = await User.findByIdAndUpdate(
            id,
            {
                image: image,
            },
            { new: true }
        );
        // Optionally, check if the user exists before updating
        if (!user) {
            return res.status(404).send({ message: 'User not found.' });
        }

        res.redirect('/profile');
    } catch (error) {
        console.error("Error in addProfilePic function:", error);
        res.status(500).send({ message: 'Internal server error.' });
    }
});

//add address---------------------------------------------------------------------------

const addUserAddress=asyncHandler(async(req,res)=>{
    try {
        const {fullName,mobile,region,pinCode,addressLine,areaStreet,ladmark,townCity,state,addressType}=req.body;
        const userId=req.session.user;
        const user=await User.findById(userId);
        const newUserAddress={ fullName,mobile,region,pinCode,addressLine,areaStreet,ladmark,townCity,state,addressType,main: false};
        if (user.address.length === 0) {
            newUserAddress.main = true;
        }
        user.address.push(newUserAddress);
        await user.save();
        res.redirect("/profile");

    } catch (error) {
        console.log("error in addUserAddress function",error);
    }
});


//edit address---------------------------------------------------------------------

const editAddress=asyncHandler(async(req,res)=>{
    try {
        const id=req.query.id;
        const userId=req.session.user;
        const user=await User.findById(userId);
        const address=user.address.id(id);
        res.render('editAddress',{address,user});

    } catch (error) {
        res.status(500).send({ message: 'Internal server error.' });  
    }
})



//update address------------------------------------------------------------------------

const updateAddress=asyncHandler(async(req,res)=>{
    try {
        const userId=req.session.user;
        const {fullName,mobile,region,pinCode,addressLine,areaStreet,ladmark,townCity,state,addressType,id} = req.body;
        const user=await User.findById(userId);
        if(user)
        {
            const oldAddress=user.address.id(id);
            if(oldAddress){
                oldAddress.fullName=fullName;
                oldAddress.mobile=mobile;
                oldAddress.region=region;
                oldAddress.pinCode=pinCode;
                oldAddress.addressLine=addressLine;
                oldAddress.areaStreet=areaStreet;
                oldAddress.ladmark=ladmark;
                oldAddress.townCity=townCity;
                oldAddress.state=state;
                oldAddress.addressType=addressType;
                await user.save();
                res.redirect('/profile');
                }
                else{
                    console.log("address not found");
                }
         }
        
        
        
    } catch (error) {
        console.log("error in update address function",error);
        res.status(500).send({ message: 'Internal server error.' });
    }
})



//delete address---------------------------------------------------------

const deleteAddress=asyncHandler(async(req,res)=>{
    try {
        const id=req.query.id;
        const userId=req.session.user;
        const user=await User.findById(userId);
        const deleteAddress = await User.findOneAndUpdate(
            { _id: userId },
            {
                $pull: { address: { _id: id } },
            },
            { new: true }
        );;
        console.log("this is the deleted address",deleteAddress);
        res.redirect('/profile');


    } catch (error) {
        console.log("error in deleteAddress function",error);
    }
});

//add new address in checkoout page--------------------------------------
const addNewAddress = asyncHandler(async(req,res)=>{
   try{
    const userId=req.session.user;
    const user=await User.findById(userId);
    console.log("new address...");

    res.render('addAddress',{user})
}catch(error){
    console.log("error in adding adress in checkout page",error);
}
});

const addUserNewAddress=asyncHandler(async(req,res)=>{
    try {
        const {fullName,mobile,region,pinCode,addressLine,areaStreet,ladmark,townCity,state,addressType}=req.body;
        const userId=req.session.user;
        const user=await User.findById(userId);
        const newUserAddress={ fullName,mobile,region,pinCode,addressLine,areaStreet,ladmark,townCity,state,addressType,main: false};
        if (user.address.length === 0) {
            newUserAddress.main = true;
        }
        user.address.push(newUserAddress);
        await user.save();
        res.redirect("/checkOut");

    } catch (error) {
        console.log("error in addUserAddress function",error);
    }
});

//edit new address in checkout page-----------------------------------------------
const editUserNewAddress=asyncHandler(async(req,res)=>{
    try {
        const id=req.query.id;
        const userId=req.session.user;
        const user=await User.findById(userId);
        const address=user.address.id(id);
        res.render('editNewAddress',{address,user});

    } catch (error) {
        res.status(500).send({ message: 'Internal server error.' });
    }
})



//update address------------------------------------------------------------------------

const updateUserNewAddress=asyncHandler(async(req,res)=>{
    try {
        const userId=req.session.user;
        const {fullName,mobile,region,pinCode,addressLine,areaStreet,ladmark,townCity,state,addressType,id} = req.body;
        const user=await User.findById(userId);
        if(user)
        {
            const oldAddress=user.address.id(id);
            if(oldAddress){
                oldAddress.fullName=fullName;
                oldAddress.mobile=mobile;
                oldAddress.region=region;
                oldAddress.pinCode=pinCode;
                oldAddress.addressLine=addressLine;
                oldAddress.areaStreet=areaStreet;
                oldAddress.ladmark=ladmark;
                oldAddress.townCity=townCity;
                oldAddress.state=state;
                oldAddress.addressType=addressType;
                await user.save();
                res.redirect('/checkout');
                }
                else{
                    console.log("address not found");
                }
         }
        
        
        
    } catch (error) {
        console.log("error in update new address function",error);
    }
})




// searchProduct -----------------------------------------------------
const searchProduct = async (req, res) => {
    try {
        console.log(req.body);
        const limit = 8; // Number of products per page
        const page = req.query.page ? parseInt(req.query.page) : 1;  // Current page number
        const product = await Product.find()
            .skip((page - 1) * limit)  // Skip the results from previous pages
            .limit(limit);  // Limit the number of results to "limit"

        const totalProduct = await Product.countDocuments();
        const totalPages = Math.ceil(totalProduct / limit);
        
        const userid = req.session.userId
        const search = req.body.search;

        const categoryload = await categoryModel.find({
            name: { $regex: new RegExp(search, "i") },
        });
        console.log(categoryload);
        const productlist = await Product.find({
            title: { $regex: new RegExp(search, "i") },
        });
        console.log(productlist);
        if (productlist.length > 0) {
            res.render("index", {
                product: productlist,
                category: categoryload,
                userid,
                page, totalPages, limit

            });
        } else if (categoryload.length > 0) {
            const product = await productModel.find({
                category: categoryload[0].name,
            });
            res.render("index", {
                product: product,
                category: categoryload,
                userid,
                page, totalPages, limit

            });
        } else {
            res.render("index", {
                product: productlist,
                category: categoryload,
                userid,
                page, totalPages, limit

            });
        }
    } catch (error) {
        res.status(500).send("An error occurred.");
    }
};

















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
    forgotPsdPage,
    forgotEmailValid,
    forgotPsdOTP,
    updatePassword,
    userProfile,
    addProfilePic,
    editProfile,
    updateProfile,
    addUserAddress,
    editAddress,
    updateAddress,
    deleteAddress,
    searchProduct ,
    emailForgot,
    addNewAddress,
    addUserNewAddress,
    editUserNewAddress,
    updateUserNewAddress
}