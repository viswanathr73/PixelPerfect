const express= require("express");
const router=express();
const {loginAdmin, adminDashboard,adminVerifyLogin, userField, blockUser, unblockUser,logout}=require('../controllers/adminctrl');
const { allCategory,addCategory,editCategory, deleteCategory,updateCategory,unlistCategory, listCategory } = require("../controllers/categoryctrl");
const {allProducts,addProduct,createProduct,editProduct,productEdited,unlistProduct,listProduct,deleteProduct}=require("../controllers/productCtrl");
const {adminOrderDetails,changeStatusPending,changeStatusConfirmed,changeStatusShipped,changeStatusCanceled,changeStatusDelivered,changeStatusReturned, adminOrderList,allOrderDetails}=require('../controllers/orderCtrl');
const {loadCoupon,addCoupon,coupon,editCoupon,deleteCoupon,updateCoupon}=require('../controllers/couponCtrl')

const errorHandler=require('../middleware/errorHandler')

router.set('view engine','ejs'); 
router.set('views','./views/admin');
const {upload}=require('../multer/multer');

const { isAdminAuth,isLoggedout } = require("../middleware/adminAuth");


//admin route-----------------------------------------------------------

router.get('/dashboard',isAdminAuth,adminDashboard);
router.get('/login',isLoggedout,loginAdmin);
router.post('/login',adminVerifyLogin);
router.get('/logout',logout);
router.get('/users',userField);
router.get('/block',blockUser);
router.get('/unblock',unblockUser);


//product route--------------------------------------------------------

router.get('/product',allProducts);
router.get('/product/:page', allProducts);
router.get('/addProduct',addProduct);
router.post('/createProduct',upload.array('images', 12),createProduct);
router.get('/editProduct',editProduct);
router.post('/productEdited',upload.array('images', 12),productEdited);
router.get('/unlistProduct',unlistProduct);
router.get('/listProduct',listProduct);
router.get('/deleteProduct',deleteProduct);
//router.post('/searchProduct',searchProduct);

//category route---------------------------------------------------------

router.get('/category',allCategory)
router.post('/addCategory',upload.single('image'),addCategory);
router.get('/editCategory',editCategory);
router.post('/updateCategory',upload.single('image'),updateCategory);
router.get('/deleteCategory',deleteCategory);
router.get('/unlistCategory',unlistCategory);
router.get('/listCategory',listCategory);

//order route-------------------------------------------------------------------------------

router.get('/adminOrderList',adminOrderList);
router.get('/adminOrderDetails',adminOrderDetails);
router.get('/changeStatusPending',changeStatusPending);
router.get('/changeStatusConfirmed',changeStatusConfirmed);
router.get('/changeStatusShipped',changeStatusShipped);
router.get('/changeStatusCanceled',changeStatusCanceled);
router.get('/changeStatusdelivered',changeStatusDelivered);
router.get('/changeStatusReturned',changeStatusReturned);

//coupon route------------------------------------------------------------------------------

router.get('/addCoupon',isAdminAuth,isAdminAuth,loadCoupon);
router.post('/addCoupon',isAdminAuth,addCoupon);
router.get('/coupon',isAdminAuth,coupon);
router.get('/editCoupon',isAdminAuth,editCoupon);
router.post('/updateCoupon',isAdminAuth,updateCoupon);
router.get('/deleteCoupon',isAdminAuth,deleteCoupon);
module.exports=router;
