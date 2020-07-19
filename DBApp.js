const mongoose= require('mongoose');
const Schema = mongoose.Schema;
const CONNECTION_STRING= process.env.DB_LOCAL;
mongoose.connect(CONNECTION_STRING,{useNewUrlParser:true})
let db= mongoose.connection;
db.on("error",console.error.bind(console,"Failed To Connect to DB"));
db.once("open",()=>console.log("We are connected to DB..."))

const personSchema= new Schema({
    name: {type:String,required:true,default:"me"},
    age: {type:Number,required: true},
    favoriteFoods:[String]

});
const Login =mongoose.model("Login",{username:String,password:String});

const Person = mongoose.model("Person",personSchema);
const createAUser =function(loginInfo,res){
    verifyUserLoginDetails(loginInfo.username,function (err,data) {
        if(err)
            res.json({error:"Error occured. Contact Developer"})
        else {
            if(data!=null && loginInfo.username == data.username)
                res.json({error:"Username '"+loginInfo.username+"' already exists"})
            else {
                const user = new Login(loginInfo)
                user.save().then(()=>console.log("Successfully saved "+JSON.stringify(user)));
                res.json(user);
            }
        }
            });
}
const createPerson = function (personData) {
   const person= new Person(personData);
   person.save().then(()=>console.log("Successfully saved person "+person));

}
const verifyUserLoginDetails =function (username,done) {
    Login.findOne({username: username},function (err,data) {
        if(err)
            return done(err);
        done(null,data);
    })
}
const queryAllPersons = function(done) {
    Person.find(function (err, data) {
        if (err)
            return done(err);
        done(null, data);
    })
}
const callQueryAllPersons = function (res) {
    queryAllPersons(function (err,data) {
        if(err)
        {
            res.send("Ooops DB Retrieval Failed")
        }
        else {
            res.json(data);
        }
    });
}
const callVerifyUser = function (loginData,res) {
    verifyUserLoginDetails(loginData,function (err,data) {
        if(err)
            res.json({status:"Error Verifying User"});
        console.log(" DB User= "+data.username+" DB Pass ="+data.password+"\n Gene Pass:"+loginData.password);
        return data;


    })
}
 const findPersonById = function (id,done) {
     Person.findOne({_id:id},function (err,data) {
         if(err)
             return done(err);
         done(null,data);
     });
 }




exports.verifyUserLoginDetails = verifyUserLoginDetails;
exports.findPersonById = findPersonById;
exports.queryAllPersons = queryAllPersons;
exports.createAUser = createAUser;
exports.createPerson = createPerson;
exports.callQueryAllPersons = callQueryAllPersons;
exports.callVerifyUser = callVerifyUser;