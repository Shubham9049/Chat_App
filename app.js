const express =require("express");
const session = require("express-session");
const passport=require("passport");
const GoogleStratagy=require("passport-google-oauth20").Strategy;
const ejs=require("ejs")
const path=require("path")
require("dotenv").config()


const app = express();

app.set("view engine","ejs")

// session initialized
app.use(session({
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{secure:false}
    // secure is false becouse we use localhost http not https and http is not secure nad not production built 
}))

// passport initialized
app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStratagy({
    clientID:process.env.CLIENT,
    clientSecret:process.env.CLIENT_SECRET,
    callbackURL:"http://localhost:3000/auth/google/callback"
},function(accesstoken,refreshtoken,profile,cb){
    cb(null,profile);
}))

// user stored in session

passport.serializeUser(function(user,cb){
    cb(null,user)
})
passport.deserializeUser(function(obj,cb){
    cb(null,obj)
})

//  we use express.static for work with static file in express 
app.use(express.static(path.join(__dirname,"public")))

app.get("/",(req,res)=>{
    res.render(path.join(__dirname,"login.ejs"))
})
app.get("/dashboard",(req,res)=>{
    if(req.isAuthenticated()){
        console.log(req.user)
        res.render(path.join(__dirname,"dashboard.ejs"),
        {user:req.user})
    }else{
        res.redirect("/")
    }
})
app.get("/auth/google",passport.authenticate("google",{scope:["profile","email"]}))
app.get("/auth/google/callback",passport.authenticate("google",{failureRedirect:"/"}),
async(req,res)=>{
    // res.render(path.join(__dirname,"dashboard.ejs"))
    res.redirect("/dashboard")
})

app.get("/logout",(req,res)=>{
    req.logOut(function (err){
        if(err){
            console.log(err)
        }else{
            res.redirect("/")
        }
    })
})

app.listen(3000,()=>{
    console.log('server started at port no :',3000);
})