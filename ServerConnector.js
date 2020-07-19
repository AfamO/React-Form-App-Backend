const express = require("express");
const body_Parser=require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cors = require("cors");
const helmet = require("helmet");


const app = express();

app.use(body_Parser.json());
app.use(cors({origin:"*"}));
app.use(helmet.hidePoweredBy({setTo:"PHP 419"}))
app.use(helmet.noCache());
app.use(helmet.xssFilter());
app.use(helmet.frameguard({action:"deny"}));
mongoose.connect(process.env.DB_LOCAL,{useNewUrlParser:true});
const User = mongoose.model("User",{username:String,password:String})


app.route("/react/:userId")
    .post((req,res)=>{
        const body =req.body;
        if(!body.username && !body.password)
            res.json({error:"Empty Body"})
        else {

            const db = mongoose.connection;
            db.once("open",()=> console.log("We have just connected to DB"))
            db.on("error",console.error.bind(console,"DB Connection Failed"));
            bcrypt.hash(body.password,Number(process.env.SALT_ROUNDS),function (err,hash) {
                if(err)
                    res.json({error:"Internal Error. Pls Contact Developer"})
                else{
                    body.password= hash;
                    const user = new User(body);
                    User.findOne({username: body.username},function (err,data) {
                        if(err)
                            res.json({error:"Internal Error. Pls Contact Developer"})
                        else if(data!=null && data.username == body.username)
                            res.json({error:"This UserName '"+body.username+"' already exists"});
                        else {
                            user.save().then(()=>console.log("Successfully Created User "+JSON.stringify(user)));
                            res.json(user);
                        }
                    })

                }
            });

        }
    })

app.listen(process.env.PORT||3001,()=>console.log("Server Started and Listening on Port "+process.env.PORT||3001))
