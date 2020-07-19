const mongoose = require('mongoose');

mongoose.connect(process.env.DB_LOCAL,{useNewUrlParser:true})

const db = mongoose.connection;
db.on("error",console.error.bind(console,"Error Connecting To DB"))
db.once("open",()=>console.log("Connected to DB"));

const User = mongoose.model("User",{username:String, password:String});
const Person = mongoose.model("Person",{name:String,age:Number,favoriteFoods:[String]});
const verifyUserLoginDetails = (username,done)=>{
    User.findOne({username:username},function (err,data) {
        if(err)
            return done(err)
        done(null,data);
    });
}

const createAUser  = (userInfo, res) => {
    User.findOne({username:userInfo.username},function (err,data) {
        if(err)
            res.json({error:"Error Occured. Contact Admin/Developer"})
        else if (data!=null && data.username == userInfo.username) {
            res.json({error:"Username '"+userInfo.username+"' already exists"})
        }
        else {
            const user = new User(userInfo);
            user.save().then(()=> console.log("Successfully created user "+JSON.stringify(user)))
            res.json(user);
        }
    });
}
const queryAllPersons = (name, age, done) =>{
    const query = Person.find({name:name});
    query.sort({name:'asc'});
    query.select("-_id,-__v");
    query.where("age").equals(age);
    query.limit(2);
    query.exec(function (err,data) {
        if(err)
            return done(err);
        done(null,data);
    })
}

const deleteAPerson = (id,done)=>{
    Person.findOne({_id:id}, function (err, data) {
        if(err)
            return done(err);
        Person.deleteOne({_id:id},function (err,data) {
            if(err)
                return done(err);
            console.log("Successfully Deleted A Person With id "+id+" Result "+JSON.stringify(data))
            done(null,data);
        }) ;
    });
}
exports.verifyUserLoginDetails = verifyUserLoginDetails;
exports.deleteAPerson = deleteAPerson;
exports.createAUser = createAUser;
exports.queryAllPersons = queryAllPersons;