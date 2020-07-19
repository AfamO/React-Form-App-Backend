const express = require('express');
const app = express();
const cors = require('cors');
const bcrypt = require('bcrypt');
const body_Parser = require('body-parser');
const helmet = require('helmet');
const dbApp3 = require('./FeaturedDBApp');

app.use(express.static(__dirname+"/views"));
app.use(body_Parser.urlencoded({extended:false}))
app.use(body_Parser.json())
app.use(cors({origin:"*"}));
app.use(helmet.hidePoweredBy({setTo:'Java 3 update 419'}));
app.use(helmet.frameguard({action:'deny'}))
app.use(helmet.noCache());
app.use(helmet.xssFilter());

app.route("/user/:userId")
    .get(function (req, res) {
        res.send({time: new Date().toString(),userId:req.params.userId})
    })
app.route("/react/:userId/login")
    .post(function (req, res) {
        const body = req.body;
        if(body ==null)
            res.json({error:"Empty form body"})
        else if (body.username!==null && body.password!=null && body.username!=="" && body.password!=""){
            dbApp3.verifyUserLoginDetails(body.username,function (err,data) {
                if(err)
                    res.json({error:"Internal Error 1. Contact Developer"})
                else {
                    bcrypt.compare(body.password,data.password,function (err, result) {
                        if(err)
                            res.json({error:"Internal Error 2. Contact Developer"})
                        if (result == true) { // the password is valid
                            console.log("The password is very much VALID")
                            res.json({status: "Valid User."})
                        }
                        else {
                            console.log("The password is INVALID")
                            res.json({status: "InValid User."})
                        }
                    });
                }
            });
        }
    })
app.route("/react/persons/")
    .get((req,res)=>{
        let query = req.query;
        console.log("For 'queryAllPersons'. Query Params =="+JSON.stringify(query));
        dbApp3.queryAllPersons(query.name,query.age,query.limit,function (err, data) {
                if(err)
                    res.json({error: "Internal Error. Contact Developer"});
                else{
                    if(data.length==0)
                        res.json({error: "No match found. Try another search criteria/combinations"});
                   else
                        res.json(data);
                }
            });
})
    .put((req,res) => {
        let body = req.body;
        console.log("For 'PUT request'. Query Body =="+JSON.stringify(body));
        if(body._id==null)
            res.json({error:"You must provide atleast an id of the person to update"})
        else
            dbApp3.updatePerson(body,function (err,data) {
                if(err)
                    res.json({error: "Internal Error. Contact Developer"});
                else
                    res.json({status:"Update Successfull",updatedData:data})
        })
    });

app.route("/react/:userId")
    .get(function(req,res){
        let query = req.query;
        let person={name:query.name, age:query.age,favoriteFoods:["Garri","IceCream","Spaghetti"]};
        console.log("About to create a person")
        dbApp3.createAPerson(person,res);
    })
    .delete((req,res)=>{
      let query =req.query;
      console.log("Delete Query =="+JSON.stringify(query));
      if(!query.hasOwnProperty("id"))
          res.json({error: "Empty query body"});
      else if(query.id=="")
          res.json({error: "You must send the id "});
      else
      {
          dbApp3.deleteAPerson(query.id,function (err,data) {
              if(err)
                  res.json({error: "Internal Error. Contact Developer"});
              else
                  res.json({status: "Successfully Deleted A Person With id "+query.id});
          });
      }
    })
    .post(function (req,res) {
        const body = req.body;
        console.log("Request Body " + JSON.stringify(body))
        if (!body.username || !body.password)
            res.json({error: "Empty form body"})
        else {
            let generatedHash = "";
            bcrypt.hash(body.password, Number(process.env.SALT_ROUNDS), function (err, hash) {
                if (err)
                    res.json({error: "Internal Error. Contact Developer"});
                else {
                    generatedHash = hash;
                    console.log("Your hash is:: " + generatedHash)
                    const userInfo = {username: body.username, password: generatedHash, status: "Success"}
                    console.log("UserInfo " + JSON.stringify(userInfo))
                    dbApp3.createAUser(userInfo,res);
                }
            });
        }
    });
app.use((req,res,next)=>{
    res.status(404) 
        .type("text")
        .send("OOOps!, the path '"+req.path+"' you requested was Not Found");
});
app.listen(process.env.PORT || 3001, ()=>console.log("Started Server Listening on port "+process.env.PORT || 3001));
