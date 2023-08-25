var express = require("express"),
mongoose = require("mongoose"),
passport = require("passport"),
bodyparser= require("body-parser"),
Localstrategy = require("passport-local"),
passportLocalMongoose = require("passport-local-mongoose"),

user = require("./model/user");
mongoose.connect("mongodb://127.0.0.1:27017/mvc");

var app = express();

app.set("view engine","ejs");
app.use(bodyparser.urlencoded({extended:true}));


app.use(require("express-session")(
    {
        secret:"Mykey",
        resave:false,
        saveUninitialized:false
    }
)
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(new Localstrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.get("/",function(req,res)
{
    res.render("home");
});

app.get("/profile",isLoggedIn,function(req,res){
    res.render("profile");
});

function isLoggedIn(req,res,next){
    if(req.isAuthenticated())
        return next();
    res.redirect("/login");
}

app.get("/register",function(req,res){
    res.render("register");
});

app.post("/register",function(req,res){
    var username = req.body.username

    user.register(new user({username:username}), req.body.password,
        function(err,user)
        {
            if(err){
                console.log(err,user)
                return res.render("register");
            }
            passport.authenticate("local")
            (req,res,function(){
                res.render("profile")
            });
        }
        );
});

//show

app.get("/login",function(req,res){
    res.render("login");
});

//handle

app.post("/login",passport.authenticate("local",{
    successRedirect:"/profile",
    failureRedirect:"/login"
}),function(req,res){
});

//handle logout


app.get("/logout",function(req,res,next){
    req.logOut(function(err){
        if(err){
            return next(err);
        }
        res.redirect("/");
    });
});


var port = process.env.port || 8080;
app.listen(port,function(){
    console.log("Server started");
});