// const User = require('../model/userModel');

// const isLogged = (req, res, next) => {
//     console.log('hhhhhhh');
//     if (req.session.user) {
//         User.findById({ _id: req.session.user }).lean()
//             .then((data) => {
//                 if (!data.isBlocked) {
//                     console.log('ghcfjhggvjkhbgjkgj');
//                     next();
//                 } else {
//                     console.log('data');
//                     console.log(data);
//                     res.redirect('/logout');
//                 }
//             })
//             .catch((error) => {
//                 console.error(error);
//                 res.status(500).send('Server Error');
//             });
//     } else {
//         res.redirect('/index');
//     }
// }
// const adminLoggedIn=(req,res,next)=>{
//     if(req.session.adminLoggedIn){
//         next()
//     }else{
//         res.redirect('/admin/login')
//     }
// }
// module.exports={
//     isLogged,
//     adminLoggedIn
// }


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
        console.log('Haiiiiii');
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
module.exports = {
    isLogged,
    isLoggedOut
}