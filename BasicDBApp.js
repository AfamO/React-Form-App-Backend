const mongoose = require('mongoose');
mongoose.connect(process.env.DB_LOCAL,{useNewUrlParser:true})
const db = mongoose.connection;
db.on("error",console.error.bind(console,"DB Connection Failed"));
db.once("open",()=> console.log("We are Connected to DB"));

const User = mongoose.model("users",{username:String,password:String});
const Person= mongoose.model("Person",{name:String,age:Number,favoriteFoods:[String]});
const getPerson = function (done, id) {
    Person.findOne({_id:id},function (err, data) {
        if(err)
            done(err)
        done(null,data);
    })
}
const verifyUserLoginDetails = function (username,done) {
    User.findOne({username:username},function (err, data) {
        if(err)
            return done(err);
        done(null,data);
    });
}
const queryPersons = function (name,age,done) {
    const query = Person.find({name:name});
    query.select("-_id,-__v")
    query.where('name').equals(name)
    query.where('age').equals(age)
    query.sort({name:'asc'});
    query.exec(function (err, data) {
        if(err)
            return done(err);
        done(null,data);
    })
}
const createAUser = function (userInfo, res) {
    verifyUserLoginDetails(userInfo.username,function (err,data) {
        if(err)
            res.json({error:"Error Occured Contact Developer"})
        else if (data!=null && data.username== userInfo.username) {
            res.json({error:"Username '"+userInfo.username+"' already exists"})
        }
        else {
            const user = new User(userInfo);
            user.save().then(()=> console.log("Successfully saved "+JSON.stringify(user)))
            res.json(user);
        }
    });
}

const queryAllUsers = function (done) {
    User.find(function (err,data) {
        if(err)
            return done(err);
        done(null,data);
    });
}
exports.queryAllUsers = queryAllUsers;
exports.verifyUserLoginDetails = verifyUserLoginDetails;
exports.createAUser = createAUser;
exports.queryPersons = queryPersons;
