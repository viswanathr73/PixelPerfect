const express = require ('express');
const app = express();
const dotenv = require("dotenv").config();
const PORT = process.env.PORT ||5000;
const userRouter = require('./routes/userRouter');
const adminRouter = require('./routes/adminRouter')
const dbConnect = require("./config/dbConnect");
const morgan = require('morgan');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongodbSession = require('connect-mongodb-session');
const cookieParser =require('cookie-parser');

dbConnect()


app.use(express.static('public'));
app.use(morgan());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine','ejs');
app.set('views','./views/users');
app.use(cookieParser());


app.use(session({
    secret:process.env.SESSION_SECRET_KEY,
    resave:false,
    saveUninitialized:true,
    cookie:{
        maxAge:72*60*1000,      //Session expires in 72 hours
        httpOnly:true
    },
}));


app.use('/',userRouter);
app.use('/admin',adminRouter);

app.listen(PORT,() => console.log("server is running    http://localhost:5000"));