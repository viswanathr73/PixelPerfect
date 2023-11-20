const express = require("express");
const router = express.Router();
const {upload}=require('../multer/multer');
const auth = require('../middleware/userAuth');

const nocache = require('nocache')

router.use(nocache())

const {aProductPage,shopProduct}=require('../controllers/productCtrl');
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
    //searchProduct
} = require('../controllers/userctrl');

const { isLogged} = require('../middleware/userAuth')



// user---------------------------------------------------------------------------

router.get('/',loadIndex);
//  router.get('/',loadHome);
router.get('/login',auth.isLoggedOut,loginUser)
router.get('/register',registerUser);
router.post('/register',createUser);
router.post('/emailVerified',emailVerified);
router.post('/login',auth.isLoggedOut,verifyUser)
// router.get('/index',loadIndex);
router.post('/resendOTP',resendOtp);
router.get('/logout',logout);

//products--------------------------------------------------------------------------
router.get('/aProduct',aProductPage)
router.get('/shop',isLogged,shopProduct)






module.exports=router;