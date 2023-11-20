const asyncHandler=require('express-async-handler')
const Category=require('../model/categoryModel')

//add category------------------------------------

const addCategory=asyncHandler(async(req,res)=>{
    try {
        const{name,description}=req.body
        const categoryExist=await Category.findOne({name})
        if(categoryExist){
            res.redirect('/admin/category')
        }else{
            const caseInsenstiveCategoryExist= await Category.findOne({
                name:{$regex:new RegExp('^'+name+'$','i')}
            })
            if(caseInsenstiveCategoryExist){
                res.redirect('/admin/category')
            }
            const newCategory=new Category({
                name,
                description,
                image:req.file.filename
            })
            await newCategory.save(
                res.redirect('/admin/category')
            )
        }
    } catch (error) {
        console.log('Add category error',error);
        
    }
})

//Get all Category from database-----------------------

const allCategory=asyncHandler(async(req,res)=>{
    try {
        const allCategory=await Category.find()
        req.session.Category=allCategory
        res.render('category',({category:allCategory}))
    } catch (error) {
        console.log('This is all category error',error);
        
    }
})

//edit category-------------------------------------

const editCategory=asyncHandler(async(req,res)=>{
    try {
        const id=req.query.id;
        const category=await Category.findById(id)
        if(category){
            res.render('editCategory',{category:category})
        }else{
            res.redirect('/admin/category')
        }
    } catch (error) {
        console.log('Error happens in categoryController editCategory function',error);
        
    }
})

//Update Category---------------------------------------------

const updateCategory=asyncHandler(async(req,res)=>{
  try {
    const id=req.body.id
    const img=req.file?req.file.filename:null;
    if(img){
        await Category.findByIdAndUpdate(id,{
            name:req.body.name,
            description:req.body.description,
            image:req.file.filename
        },{new:true})
    }else{
        await Category.findByIdAndUpdate(id,{
            name:req.body.name,
            description:req.body.description,
        },{new:true})
    }
    res.redirect('/admin/category')
  } catch (error) {
    console.log('Update category error');
    
  }
});

//delete category----------------------------------------

const deleteCategory=asyncHandler(async(req,res)=>{
    try {
        const id=req.query.id
        const category=await Category.findByIdAndDelete(id)
        res.redirect('/admin/category')
    } catch (error) {
        console.log('Delete Category error',error);
        
    }
})

//Unlist a category--------------------------------------------------

const unlistCategory=asyncHandler(async(req,res)=>{
    try {
        const id=req.query.id
        const unlistedCategory=await  Category.findByIdAndUpdate(id,{status:true},{new:true})
        res.redirect('/admin/category')
    } catch (error) {
        console.log('Unlist category error');
        
    }
})

//list category-----------------------------------------------

const listCategory=asyncHandler(async(req,res)=>{
    try {
        const id=req.query.id
        const listedCategory=await Category.findByIdAndUpdate(id,{status:true},{new:true})
        res.redirect('/admin/category')
    } catch (error) {
        console.log('List category error',error);
        
    }
})
module.exports={
    addCategory,
    allCategory,
    editCategory,
    updateCategory,
    deleteCategory,
    unlistCategory,
    listCategory
}