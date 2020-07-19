var express = require("express");
var cors = require("cors");
const bodyParser = require("body-parser");
const app = express();


app.use(express.static(__dirname+"/views/"));
//app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json())
app.use(cors({origin:"*"}));

app.route("/user/:userId")
    .get(function (req,res) {
        res.json({userId:req.params.userId});
    })
app.route("/react/:userId")

    .get(function (req, res) {
        res.json({time:new Date().toString(),name: req.query.name, pass:req.query.password,param:req.params.userId});
    })
    .post(function (req,res) {
        console.log("Received Post Request")
        const body= req.body;
        let username = req.body.username;
        let password = req.body.password;
        body.status="Successfull Operation";
        const  result ={username:username,password:password,status:"Success operation"};
        console.log("Sent Result::"+JSON.stringify(result)+" Username: "+username+" password:"+password);
        res.send(result);

    })



app.listen(process.env.PORT || 3001, ()=>console.log("Server Started, Listening on port "+process.env.PORT));