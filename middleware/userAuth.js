
const User = require('../model/userModel')



const isLogged = (req, res, next) => {

    if (req.session.user) {
        const user = User.findById(req.session.user).lean()
        if (user) {
            if (user && !user.isBlocked) {
                 req.user = user;
                next();
            } else if (user.isBlocked) {
                req.session.destroy()
                res.redirect('/');
            } else {
                res.redirect('/login');

            }
        }
        else {
            res.redirect('/login');

            console.error(error);
            res.status(500).send('No User data found');
        };
    } else {
        
        res.redirect('/login');

    }
};


const isLoggedOut = (req, res, next) => {
    if (req.session.user) {
        res.redirect('/')
    } else {
        next();

    }
}
// const adminLoggedIn=(req,res,next)=>{
//     if(req.session.adminLoggedIn){
//         next()
//     }else{
//         res.redirect('/admin/login')
//     }
// }


const isBlocked = async (req,res,next)=>{
    try {
        const id = req.session.user
        // console.log("this is id of user"+id)
        if(!id){
            next();
        }else{
        const user = await User.findById(id);
        // console.log("this is user session from is blocked" ,user);
        if(user.isBlocked == false){
            next();
        }else{
            req.session.destroy(err => {
                if (err) throw err;
                const userSession = req.session;
                res.render('login',{message:"your account has been blocked by administrator",userSession})
              });

            }
        }

    }catch(error){
console.log("is Blocked error")
    }
}



module.exports = {
    isLogged,
    isLoggedOut,
    isBlocked
}