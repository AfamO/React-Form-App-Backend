
const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const ReactInput = mongoose.model('Input',{input:String});
const Login = mongoose.model("icplogin",{username:String,password:String})

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json())
app.use(cors({origin:'*'}));

app.route("/react")
    .get(function (request, response) {
        console.log("Testing React");
        console.log("My Query =="+JSON.stringify(request.query));
        /**
         * Testing
         */
        mongoose.connect(process.env.DB,{useNewUrlParser:true});
        const myInput = request.query.input;
        let loginData = {
            username: request.query.username,
            password: request.query.password
        }
        const input = new Login(loginData);
        input.save().then(()=> console.log("Successfully saved  "+JSON.stringify(loginData)));

        response.json(loginData);
    })
    .post(function (request, response) {
        console.log("Testing React");
        console.log("Accepting Form Input");
        let body = request.body;
        console.log("React Form Body:"+JSON.stringify(body));
        mongoose.connect(process.env.DB,{useNewUrlParser:true});
        const login = new Login(body);
        login.save().then(()=> console.log("Successfully saved "+JSON.stringify(body)));
        response.json(body);
    })

    app.listen(process.env.PORT || 3001,
        ()=>console.log("Listening on port "+process.env.PORT)
    );