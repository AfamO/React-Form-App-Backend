const  express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const body_Parser= require('body-parser');
const  bcrypt = require('bcrypt');
const app = express();

app.use(helmet.hidePoweredBy({setTo:'Java 11 u12'}))
app.use(helmet.frameguard({action:'deny'}));
app.use(helmet.xssFilter());
app.use(helmet.noCache());
app.use(express.static(process.cwd()+"/views"))
app.use(body_Parser.json());
app.use(cors({origin:'*'}));

app.route("/user/:userId")
    /**
    .get(function (req,res) {
        res.sendFile(__dirname+"/views/index.html");
    })
     */
    .get(function(req,res){
        res.json({time: new Date().toString(),userId:req.params.userId});
    })

app.route("/react/:userId")
    .get(function (req, res) {
        res.json({time:new Date().toString(),name:req.query.name, password:req.query.password, userId:req.params.userId})
    })
    .post(function (req, res) {
        const body = req.body;
        let hashedPassword="";
        bcrypt.hash(body.password,parseInt(process.env.SALT_ROUNDS),function (err,hash) {

            if(err){
                console.log("Error occured hashing::"+err)
                res.json({msg:"Internal Error"});
            }
            else{
                hashedPassword=hash;
                console.log("The hashedPassword:: "+hashedPassword)
                bcrypt.compare(body.password+"",hashedPassword,function (req,res) {

                    if(res==true)
                        console.log("The password is valid ")
                    else
                        console.log("Invalid Password")
                });
                console.log("Post Request PayLoad ::"+JSON.stringify(body));
                const response = {username:body.username,password:hashedPassword,msg:"Successfull Submission"}
                console.log("Sent Response::"+JSON.stringify(response));
                res.json(response);
            }

        });


    })
app.listen(process.env.PORT, ()=>console.log("Started Server Listening on port "+process.env.PORT));