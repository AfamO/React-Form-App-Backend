const express = require("express")
const app=  express();
const cors = require("cors")({origin:"*"});
const body_Parser = require('body-parser');
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const helmet = require("helmet");
const passport = require('passport');
const session = require('express-session');
const LocalStrategy = require('passport-local');
app.use(body_Parser.json())
app.use(cors);
app.use(helmet.hidePoweredBy({setTo:"Pascal 419"}));
app.use(helmet.frameguard({action:"deny"}))
app.use(helmet.xssFilter());
app.use(helmet.noCache());

app.use(express.static(process.cwd()+"/views"))


app.use(session({
    secret:process.env.SESSION_SECRET,
    resave:true,
    saveUninitialized:true,
}))
app.use(passport.initialize());
app.use(passport.session())

mongoose.connect(process.env.DB_LOCAL, {useNewUrlParser: true}).then(r  =>console.log("Succesffully Connected to DB")).catch((err)=>console.log("Failed to connect to DB. Detail:"+err));
const User = mongoose.model("User",{username:String,password:String});
const Person = mongoose.model("Person",{name:String,age:Number,favoriteFoods:[String]})
const errorMsg={};
let loggedInStatusMessage="";

passport.use(new LocalStrategy((username,password,done)=>{
    User.findOne({username:username},(err,user)=>{
        if(err) done(err);
        if(!user){ loggedInStatusMessage="Attempted Logged In Failed:Unknown User", done(err);}
        bcrypt.compare(password,user.password,(err,result)=>{
            if(err) done(err);
            else if(result==false){loggedInStatusMessage="Attempted Logged In Failed: Invalid Password"; done(null,false)}
            else {loggedInStatusMessage="You are successfully Logged In"; done(null,user)}
        });// End password hash compare
    })// End DB Query
}));
 passport.serializeUser((user,done)=>{
     console.log("Serialized User Id =="+user._id)
    done(null,user._id)
});

passport.deserializeUser((id,done)=>{
    User.findOne({_id:id},(err,data)=>{
        console.log("Deserialized User =="+JSON.stringify(data))
        done(null,data);
    })
})

app.route("/react/:userId/login")
    .post(passport.authenticate("local",{failureRedirect:"/react/failure/failedLogin"}), (req,res)=>{
        const body = req.body;
        console.log("Request Body =="+JSON.stringify(body))
        if(!body.username || !body.password)
            res.json(errorMsg.error="Empty Request Body!")
        else {
            res.json({status:loggedInStatusMessage})
        } // end else
    })
app.route("/react/failure/failedLogin")
    .get((req,res)=>{
        console.log("So you failed LoggedIn Authentication?")
        res.json({status:loggedInStatusMessage});
    })

app.route("/react/:userId")
    .post((req,res)=>{
        const body = req.body;
        if(!body.username && !body.password)
            res.json(errorMsg.error="Empty Request Body!")
        else {
            bcrypt.hash(body.password,parseInt(process.env.SALT_ROUNDS),function (err,hash) {
                if(err)
                    res.json(errorMsg.error="Internal Error. Contact Developer");
                else {
                    body.password = hash;
                    User.findOne({username:body.username},function (err,data) {
                        if(err)
                            res.json(errorMsg.error="Internal Error. Contact Developer")
                        else if(data!=null && data.username == body.username)
                            res.json(errorMsg.error="The UserName '"+body.username+"' already exists")
                        else {
                            const user= new User(body);
                            user.save().then(()=>console.log("Successfully created user::"+JSON.stringify(user)))
                            res.json(user);
                        }
                    })


                }
            })
        }
    })
    .get((req,res)=>{
      const query = req.query;
        let queryDB= Person.find();
        queryDB.select("-_id -__v")
        queryDB.sort({name:"asc"})
        if(query.name)
          queryDB.where("name").equals(query.name);
        if(query.name)
          queryDB.where("age").equals(query.age);
        if(query.limit)
          queryDB.limit(parseInt(query.limit))
        queryDB.exec(function(err,data){
          if(err)
            res.json(errorMsg.error="Error occured. Contact Developer")
          else
            res.json(data)

        });
    })
  app.route("/react/persons")
  .put((req,res)=>{
    const body= req.body;
    if(!body.name || !body.age || !body.favoriteFoods)
      res.json(errorMsg.error="Empty Form Body. Please pass all complete body params")
    else {
      Person.findOne({_id:body._id},(err, data)=>{
        if(err)
          res.json(errorMsg.error="Error occured. Contact Developer. Details::"+err)
        else if(data==null)
          res.json(errorMsg.error="Cannot find the person with id "+body._id);
        else {
          //Update accordingly
          for(let key in body){
            data[key]=body[key];
          }
          data.save().
          then(()=>{
              console.log("Successfully Updated Person . Result: "+JSON.stringify(data))
              res.json({status:"Update Successfull", updatedData:data})
          }).
          catch((err)=>{
              console.log("Update Error- Detail ::"+err)
              res.json(errorMsg.error="Oops! Error occured updating this person")
          })

        }

      })
    }
  })
app.route("/logout")
    .get((req,res)=>{
       req.logout();
       console.log("Successfully Logged Out "+req.username)
       res.redirect("/")
    });






app.listen(process.env.PORT|| 3001,()=>console.log("Successfully Started Server At Port "+process.env.PORT||3001))
