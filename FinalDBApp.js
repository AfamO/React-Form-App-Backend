const mongoose = require('mongoose');

mongoose.connect(process.env.DB_LOCAL,{useNewUrlParser:true});
const db = mongoose.connection;
db.on("error",console.error.bind(console,"Failed to connect to DB"));
db.once("open",()=>console.log("Successfully Connected to DB"));

const Person = mongoose.model("Person",{name:String,age:Number,favoriteFoods:[String]});
const User = mongoose.model("User",{username:String,password:String});

const createAPerson = (personInfo,res) =>{
    Person.findOne({name:personInfo.name},function (err,data) {
        if(err)
            res.json({error: "Error Occured. Contact Developer"});
        else if(data!=null && data.name == personInfo.name)
            res.json({error: "The person with this name '"+personInfo.name+"' already exists"});
        else {
            const person = new Person(personInfo)
            person.save().then(()=>console.log("Successfully created  person "+JSON.stringify(person)));
            res.json(person);
        }
    });
}

 exports. createAUser = (userInfo, res) =>{
    User.findOne({username: userInfo.username}, function (err, data) {
        if(err)
            res.json({error: "Error Occured. Contact Developer"});
        else if(data!=null && userInfo.username == data.username)
            res.json({error: "This UserName '"+data.username+"' already exists"});
        else {
            let user = new User(userInfo);
            user.save().then(()=> console.log("Successfully created a user "+JSON.stringify(user)))
        }
    });
}

const  verifyUserLoginDetails = (username,done)=>{
    User.findOne({username:username}, function (err,data) {
        if(err)
            return done(err);
        done(null,data);
    })
}

const deleteAPerson = (_id, done)=>{
    Person.deleteOne({_id:_id},function (err, data) {
        if(err)
            return done(err);
        done(null,data);
    });
}

const queryAllPersons = (name,age,limit,done) =>{
    let query = Person.find();
    query.sort({name:'asc'})
    if(name!=null && name!="")
        query.where("name").equals(name);
    if(age!=null && age!="")
        query.where("age").equals(age);
    if(limit!=null && limit!="")
        query.limit(parseInt(limit));

    query.exec(function (err,data) {
        if(err)
        {
            console.log("DB Error::: "+err)
            return done(err);
        }
        done(null,data);
    });
}

const updatePerson = (personData,done) =>{
    Person.findOne({_id:personData._id},function (err,data) {
        if(err)
            return done(err);
        if(data==null)
            return done("Null Reference Error. Ensure id exists")
        data.name= personData.name;
        data.age = personData.age;
        data.favoriteFoods=personData.favoriteFoods;
        data.save().then(()=>console.log(" Successfully Updated Person Data "+JSON.stringify(data)))
        done(null,data)

    });
}

exports.createAPerson = createAPerson;
exports.updatePerson = updatePerson;
exports.verifyUserLoginDetails = verifyUserLoginDetails;
exports.queryAllPersons = queryAllPersons;
exports.deleteAPerson = deleteAPerson;
