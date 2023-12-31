const express = require("express");
const router = express.Router();
const {upload}=require('../multer/multer');
const auth = require('../middleware/userAuth');
const nocache = require('nocache')
router.use(nocache())
const errorHandler=require('../middleware/errorHandler')

const {aProductPage,shopProduct}=require('../controllers/productCtrl');
const{getCart,addToCart,deleteCartItem,deleteCart,modifyCartQuantity}=require("../controllers/cartCtrl");
const {
    loginUser,
    registerUser,
    createUser,
    emailVerified,
     verifyUser,
    loadIndex,
    resendOtp,
    //loadHome,
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
    searchProduct,
    emailForgot,
    addNewAddress,
    addUserNewAddress
} = require('../controllers/userctrl');

const {checkOut,orderPlaced,orderDetails,orderPage,allOrderDetails,cancelOrder,returnOrder,verifyPayment,useWallet,buyNOw,buynowPlaceOrder}=require('../controllers/orderCtrl');
const {productSearch,CategoryFilter,filterSearch,priceFilter,brandFilter,clearFilter,sortByPrice}=require('../controllers/filterCtrl');
const {addToList,Wishlist,deleteWishlistItem}=require('../controllers/wishlistCtrl');
const {addMoneyWallet,updateMongoWallet,sumWallet,sumWalletBuynow,walletPayment}=require('../controllers/walletCtrl')
const {validateCoupon}=require('../controllers/couponCtrl');
const { isLogged} = require('../middleware/userAuth')
const {invoice,invoices}=require('../controllers/invoiceCtrl');
const {aboutpage}=require('../controllers/aboutCtrl');
const {blogpage}=require('../controllers/blogCtrl');
const {contactpage}=require('../controllers/contactCtrl');


// user---------------------------------------------------------------------------

router.get('/',loadIndex);
//  router.get('/',loadHome);
router.get('/login',auth.isLoggedOut,loginUser)
router.get('/register',registerUser);
router.post('/register',createUser);
router.post('/emailVerified',emailVerified);
router.post('/login',auth.isLoggedOut,verifyUser)
router.post('/searchProduct',searchProduct);
router.post('/resendOTP',resendOtp);
router.get('/logout',logout);
router.get('/forgotPassword',forgotPsdPage);
router.post('/forgotEmailValid',forgotEmailValid);
router.post('/forgotPsdOTP', forgotPsdOTP);
router.post('/updatePassword', updatePassword);
router.get('/emailForgot',emailForgot)
//user profile------------------------------------------
router.get('/profile',isLogged,auth.isBlocked,userProfile);
router.post('/addProfilePic',isLogged,auth.isBlocked,upload.single('image'), addProfilePic);
router.get('/editProfile',isLogged,auth.isBlocked,editProfile);
router.post('/updateProfile',isLogged,auth.isBlocked,updateProfile);

//user address ----------------------------------------------------
router.post('/addUserAddress',isLogged,addUserAddress);
router.get('/editAddress',isLogged,editAddress);
router.get('/addNewAddress',isLogged,addNewAddress);
router.post('/addNewAddress',isLogged,addUserNewAddress)
router.post('/updateAddress',isLogged,updateAddress);
router.get('/deleteAddress',isLogged,deleteAddress);

//products -------------------------------------------------------------------
router.get('/aProduct',isLogged,auth.isBlocked,upload.single('images'),aProductPage)
router.get('/shop',isLogged,shopProduct)


//cart ---------------------------------------------------------
router.get('/cart',isLogged,auth.isBlocked,getCart);
router.get('/addToCart',isLogged,auth.isBlocked,addToCart);
router.get('/deleteCartItem',isLogged,deleteCartItem);
router.post('/modifyCartQuantity',isLogged,modifyCartQuantity);
router.get('/deleteCart',isLogged,deleteCart);

//order -----------------------------------------------------
router.get('/checkout',isLogged,auth.isBlocked,checkOut);
router.post('/orderPlaced',isLogged,auth.isBlocked,orderPlaced);
router.get('/orderDetails',isLogged,auth.isBlocked,orderDetails);
router.get('/orderPage',isLogged,auth.isBlocked,orderPage);
router.get('/allOrderDetails',isLogged,auth.isBlocked,allOrderDetails);
router.get('/cancelOrder',isLogged,cancelOrder);
router.post('/return',isLogged,returnOrder);
router.post('/verifyPayment',isLogged,verifyPayment);
router.get('/buyNOw',isLogged,auth.isBlocked,buyNOw);
router.post('/buynowPlaceOrder',isLogged,auth.isBlocked,buynowPlaceOrder);

//filter---------------------------------------------------------------------------------

router.post('/productSearch',productSearch);
router.get('/CategoryFilter',CategoryFilter);
router.post('/filterSearch',filterSearch);
router.get('/priceFilter',priceFilter);
router.get('/brandFilter',brandFilter);
router.get('/clearFilter',clearFilter);//clear all the filter 
router.get('/sortByPrice',sortByPrice);



//wallet--------------------------------------------------
router.post('/addMoneyWallet',isLogged,auth.isBlocked,addMoneyWallet)
router.post('/updateMongoWallet',isLogged,updateMongoWallet)
router.post('/useWallet',isLogged,useWallet)
router.get('/sumWalletBuynow',isLogged,sumWalletBuynow)
router.post('/walletPayment',isLogged,walletPayment)
router.post('/sumWallet',sumWallet);

//coupon----------------------------------------------------------------------------------

router.post('/validateCoupon',validateCoupon);

//wishlist ---------------------------------------------------------------


router.get('/Wishlist',isLogged,auth.isBlocked,Wishlist)        //rendering the wishlist
router.get('/addToList',isLogged,addToList)      // add apriduct to the wish list
router.get('/deleteWishlistItem',isLogged,deleteWishlistItem)

//invoice--------------------------------------------------------------------------------------

router.get('/invoice',isLogged,invoice);
router.get('/invoices',isLogged,invoices);


//about--------------------------------------------------------------------------------

router.get('/about',aboutpage)

//blogpage--------------------------------------------------------------

router.get('/blog',blogpage)

//contact page--------------------------------------------------------------

router.get('/contact',contactpage)



module.exports=router;