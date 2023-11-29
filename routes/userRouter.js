const express = require("express");
const router = express.Router();
const {upload}=require('../multer/multer');
const auth = require('../middleware/userAuth');
const nocache = require('nocache')
router.use(nocache())

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
    emailForgot
    
} = require('../controllers/userctrl');

const {checkOut,orderPlaced,orderDetails,orderPage,allOrderDetails,cancelOrder,returnOrder}=require('../controllers/orderCtrl');
const {addToList,Wishlist,deleteWishlistItem}=require('../controllers/wishlistCtrl');
// const {addMoneyWallet,}=require('../controllers/walletCtrl');

const { isLogged} = require('../middleware/userAuth')



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
router.get('/profile',isLogged,userProfile);
router.post('/addProfilePic',isLogged,upload.single('image'), addProfilePic);
router.get('/editProfile',isLogged,editProfile);
router.post('/updateProfile',isLogged,updateProfile);

//user address ----------------------------------------------------
router.post('/addUserAddress',isLogged,addUserAddress);
router.get('/editAddress',isLogged,editAddress);
router.post('/updateAddress',isLogged,updateAddress);
router.get('/deleteAddress',isLogged,deleteAddress);

//products -------------------------------------------------------------------
router.get('/aProduct',isLogged,upload.single('images'),aProductPage)
router.get('/shop',isLogged,shopProduct)


//cart ---------------------------------------------------------
router.get('/cart',isLogged,getCart);
router.get('/addToCart',isLogged,addToCart);
router.get('/deleteCartItem',isLogged,deleteCartItem);
router.post('/modifyCartQuantity',isLogged,modifyCartQuantity);
router.get('/deleteCart',isLogged,deleteCart);

//order -----------------------------------------------------
router.get('/checkout',isLogged,checkOut);
router.post('/orderPlaced',isLogged,orderPlaced);
router.get('/orderDetails',isLogged,orderDetails);
router.get('/orderPage',isLogged,orderPage);
router.get('/allOrderDetails',isLogged,allOrderDetails);
router.get('/cancelOrder',isLogged,cancelOrder);
router.get('/return',isLogged,returnOrder);

//wallet--------------------------------------------------
// router.post('/addMoneyWallet',isLogged,addMoneyWallet)


//wishlist ---------------------------------------------------------------


router.get('/Wishlist',isLogged,Wishlist)        //rendering the wishlist
router.get('/addToList',isLogged,addToList)      // add apriduct to the wish list
router.get('/deleteWishlistItem',isLogged,deleteWishlistItem)



module.exports=router;