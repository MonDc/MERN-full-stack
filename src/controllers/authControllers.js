const { MongoClient, ObjectID } = require('mongodb')
const emaiVerifier = require('./emailVerfiy');

const conf = require('../conf');
const dbUrl = conf.dbUrl;
const dbName = conf.dbName;


function addUser(firstName, lastName, dateOfBirth, gender, userName, email, phoneNumber, password, active, host, callback) {
    (async function mongo() {
        let client;
        try {
            let rand = Math.floor((Math.random() * 100) + 54);
            client = await MongoClient.connect(dbUrl, { useNewUrlParser: true });
            const db = client.db(dbName);
            const username1 = await db.collection('users').findOne({
                userName: userName

            });
            const email1 = await db.collection('users').findOne({
                email: email

            });
            const phone1 = await db.collection('users').findOne({
                phoneNumber: phoneNumber

            });
            if (username1 || email1 || phone1) {
                client.close();
                callback(false)

            } else {
                const response = await db.collection('users').insertOne({
                    firstName: firstName,
                    lastName: lastName,
                    dateBirth: dateOfBirth,
                    gender: gender,
                    userName: userName,
                    email: email,
                    phoneNumber: phoneNumber,
                    password: password,
                    active: active,
                    verify: false,
                    userType: "normal",
                    verifyNumber: rand

                });
                //console.log(response.ops[0].active)
                client.close();
                emaiVerifier.sendverfyEmail(email, "Blogger verify your Email", "Please click this link to verify your Account" + "<br>" + "http://" + host + ":4000/verify?id=" + rand);
                callback(response.ops[0]);
                // callback(true)
            }
        } catch (error) {
            console.log(error.message);
            client.close();
            callback(false)

        }
    }())
}


function checkUserforlogin(userName, password, callback) {
    (async function mongo() {
        let client;
        try {
            client = await MongoClient.connect(dbUrl, { useNewUrlParser: true });
            const db = client.db(dbName);
            const col = await db.collection('users');
            const user = await col.findOne({
                userName: userName,
                password: password,
            });
            //console.log(user)
            client.close();
            callback(user)

        } catch (error) {
            console.log(error.message)
            client.close();
            callback(null)

        }
    }())
}


function changePassword(id, newPassword, done) {
    (async function mongo() {
        let client;
        try {
            client = await MongoClient.connect(dbUrl, { useNewUrlParser: true });
            const db = client.db(dbName);
            const col = await db.collection('users');
            const response = await col.updateOne(
                {
                    _id: new ObjectID(id)  // _id: fieldname in DB , new.. that means the object wich have this id 
                },
                {
                    $set: {
                        password: newPassword  // password:field name in DB and newPassword is input text name
                    }
                });
            done(response)


        } catch (error) {
            done(error.message)
        }
        client.close();
    }())
}


function changePersonalInfo(id, firstName, lastName, dateOfBirth, userName, phoneNumber, newPassword, done) {
    (async function mongo() {
        let client;
        try {
            client = await MongoClient.connect(dbUrl, { useNewUrlParser: true });
            const db = client.db(dbName);
            const col = await db.collection('users');
            const response = await col.updateOne(
                {
                    _id: new ObjectID(id)
                },
                {
                    $set: {
                        firstName: firstName,
                        lastName: lastName,
                        dateBirth: dateOfBirth,
                        userName: userName,
                        phoneNumber: phoneNumber,
                        password: newPassword


                    }
                });
            done(true, response)


        } catch (error) {
            done(false, error.message)
        }
        client.close();
    }())
}


function getUser(id, done) {  // done callback
    (async function mongo() {
        let client;
        try {
            client = await MongoClient.connect(dbUrl, { useNewUrlParser: true });
            const db = client.db(dbName);
            const blog = await db.collection('users').findOne({
                _id: new ObjectID(id)    // this is filter   // it will convert to objectID (its like this in mongo DB)
            });
            client.close();
            done(true, blog);

        } catch (error) {
            client.close();
            done(false, error.message);
        }
    }())
}

// make update as library for all project,
// to display info about the function use:before the function: "/**+Enter */". and fill the params

/**
 * This Function to update the data in MongoDb Database.  
 * @param {*} dbURL as a string value.
 * @param {*} dbName as a string value.
 * @param {*} colName as a string value.
 * @param {*} target as a string value.
 * @param {*} data as an object.
 * @param {*} done calling back the resurl
 */
function updateDatabase(dbURL, dbName, colName, target, data, done) {
    (async function mongo() {
        let client;
        try {
            client = await MongoClient.connect(dbURL, { useNewUrlParser: true });
            const db = client.db(dbName);
            const col = await db.collection(colName);
            const response = await col.updateOne({
                _id: new ObjectID(target)
            },
                {
                    $set: data
                });
            done(true, response)
        } catch (error) {
            done(false, error.message)
        }
        client.close();
    }())
}

//end make update as library for all project


// function delete user or make active:false

function deleteUser(id, done) {
    (async function mongo() {
        let client;
        try {
            client = await MongoClient.connect(dbUrl, { useNewUrlParser: true });
            const db = client.db(dbName);
            const col = await db.collection('users');
            const response = await col.updateOne(
                {
                    _id: new ObjectID(id)
                },
                {
                    $set: {
                        active: false
                    }
                });
            done(true, response)


        } catch (error) {
            done(false, error.message)
        }
        client.close();
    }())
}

//end function delete user or make active:false

// function checkAdminforlogin(active, callback) {
//     (async function mongo() {
//         let client;
//         try {
//             client = await MongoClient.connect(dbUrl, { useNewUrlParser: true });
//             const db = client.db(dbName);
//             const col = await db.collection('users');
//             const admin = await col.findOne({
//                 active: true
//             });
//             //console.log(user)
//             client.close();
//             callback(admin)

//         } catch (error) {
//             client.close();
//             callback(null)

//         }
//     }())
// }

function addBlog(title, keyWords, description, catValue, newCategory, exist, created, imgUrl, done) {  // done is callback

    (async function mongo() {
        let client;
        try {
            client = await MongoClient.connect(dbUrl, { useNewUrlParser: true });
            const db = client.db(dbName);
            if (catValue === '-1') {
                const catResponse = await db.collection('categories').insertOne({ title: newCategory });
                console.log(catResponse.insertedId);
                catValue = catResponse.insertedId;
            }
            const response = await db.collection('Blogs').insertOne({
                title: title,
                keyWords: keyWords,
                description: description,
                category: catValue,
                exist: exist,
                created: created,
                imgUrl: imgUrl
            });
            client.close();
            done(response);
        } catch (error) {
            client.close();
            done(error.message);
        }
    }());
}
//impotant: we must write this code in main.js (public/js/main.js )


// // hide show category field in newadv.ejs
// function checkCat(){
//     let selectedOption = $("#categorySelect").children("option:selected").val();
//  //alert(selectedOption);
//  if(selectedOption === "-1"){
//  //alert(selectedOption);
//  $('#newcatContainer').removeClass('d-none');
//  }else{
//  $('#newcatContainer').addClass('d-none');
//  }
//  }
//  checkCat();
//     $("#categorySelect").change(()=>{
//         checkCat();
//     });


function getBlog(id, done) {  // done callback
    (async function mongo() {
        let client;
        try {
            client = await MongoClient.connect(dbUrl, { useNewUrlParser: true });
            const db = client.db(dbName);
            const blog = await db.collection('Blogs').findOne({
                _id: new ObjectID(id)    // this is filter   // it will convert to objectID (its like this in mongo DB)
            });
            client.close();
            done(true, blog);

        } catch (error) {
            client.close();
            done(false, error.message);
        }
    }())
}


function getCategories(done) {
    (async function mongo() {
        let client;
        try {
            client = await MongoClient.connect(dbUrl, { useNewUrlParser: true });
            const db = client.db(dbName);
            const cats = await db.collection('categories').find().toArray();
            client.close();
            done(true, cats);
        } catch (error) {
            client.close();
            done(false, error.message);
        }
    }())
}


// function delete blog or make exist:false

function deleteBlog(id, done) {
    (async function mongo() {
        let client;
        try {
            client = await MongoClient.connect(dbUrl, { useNewUrlParser: true });
            const db = client.db(dbName);
            const col = await db.collection('Blogs');
            const response = await col.updateOne(
                {
                    _id: new ObjectID(id)
                },
                {
                    $set: {
                        exist: false
                    }
                });
            done(true, response)


        } catch (error) {
            done(false, error.message)
        }
        client.close();
    }())
}

//end function delete blog or make exist:false



function changeBlogInfo(id, title, keyWords, description, catValue, newCategory, done) {
    (async function mongo() {
        let client;
        try {
            client = await MongoClient.connect(dbUrl, { useNewUrlParser: true });
            const db = client.db(dbName);
            if (catValue === '-1') {
                const catResponse = await db.collection('categories').insertOne({ title: newCategory });
                console.log(catResponse.insertedId);
                catValue = catResponse.insertedId;
            }
            const col = await db.collection('Blogs');
            const response = await col.updateOne(
                {
                    _id: new ObjectID(id)
                },
                {
                    $set: {
                        title: title,
                        keyWords: keyWords,
                        description: description,
                        category: catValue
                        // imgUrl: imgUrl
                    }
                });

            done(true, response)
        } catch (error) {
            done(false, error.message)
        }
        client.close();
    }())
}



module.exports = { addUser, changePersonalInfo, checkUserforlogin, changePassword, addBlog, getCategories, getBlog, updateDatabase, changeBlogInfo, getUser, deleteUser, deleteBlog }