const express = require('express');
const multer = require('multer');
const userid = require('userid');
const adminRoutes = express.Router();
const endUserControllers = require('../controllers/endUserControllers');
const authControllers = require('../controllers/authControllers');
const { MongoClient, ObjectID } = require('mongodb')



//Database Info
const conf = require('../conf');
const dbUrl = conf.dbUrl;
const dbName = conf.dbName;



// using session as a middleware

adminRoutes.use((req, res, next) => {
    if (req.session.user) {
        //console.log(req.session) very important to see what happens if u log.console only the req session 
        next();

    } else {
        res.redirect('/auth/login')
    }
});

adminRoutes.route('/').get((req, res) => {
    console.log("SessionHHHHHHHHHH")
    console.log(req.session.user)
    res.render('admin', { user: req.session.user });
});



//change Password
adminRoutes.route('/changepassword').get((req, res) => {
    if (req.session.user) {
        res.render('changepassword', { user: req.session.user })
    } else {
        res.redirect('/')
    }
});
adminRoutes.route('/changepassword').post((req, res) => {
    authControllers.changePassword(req.session.user._id, req.body.newPassword, (result) => {
        console.log(result)
        //console.log(req.session.loginSuccess)
        req.session.destroy();
        res.redirect('/auth/login')
    })
});

// end change Password




//change Personal Info
adminRoutes.route('/personalinfo').get((req, res) => {
    if (req.session.user) {
        const id = req.session.user._id;
        console.log(id);
        // res.render('personalinfo')
        authControllers.getUser(id, (check, data) => {

            if (check) {
                res.render('personalinfo', { data, user: req.session.user })
            }
        })

    } else {
        res.redirect('/')
    }
});




adminRoutes.route('/personalinfo').post((req, res) => {
    authControllers.changePersonalInfo(req.session.user._id, req.body.firstName, req.body.lastName, req.body.dateOfBirth, req.body.chooseUserName, req.body.phoneNumber, req.body.passwordname, (result) => {
        console.log(result)

        req.session.destroy();
        res.redirect('/auth/login')
    })
});


// end change personal Info






// multer config
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function (req, file, callback) {
        callback(null, Date.now() + '-' + file.originalname)
    }
});
const upload = multer({ storage: storage });
adminRoutes.use('/addBlog', upload.array('UploadToDB', 10));

//end multer config



// get all users

adminRoutes.route('/usersmanag').get((req, res) => {
    endUserControllers.getUsers((ok, result) => {
        if (ok) {
            res.render('usersmanag', { result, user: req.session.user });
        } else {
            res.send(result);
        }

    });

});

// end get all users






//this update get from update library (that created in authControllers file)

// update user info

adminRoutes.post("/userinfo", (req, res) => {
    authControllers.updateDatabase(dbUrl, dbName, "users", req.body.ID, {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        userName: req.body.chooseUserName,
        dateBirth: req.body.dateOfBirth,
        phoneNumber: req.body.phoneNumber,
        password: req.body.passwordname
    }, (ok, data) => {
        if (ok) {
            res.json(data);

        } else {
            res.json(data);
        }
    });
});

//  end update user info

// end update get from library






// This route to delete User

adminRoutes.post("/del", (req, res) => {
    authControllers.updateDatabase(dbUrl, dbName, "users", req.body.ID, {
        active: false
    }, (ok, data) => {
        if (ok) {
            res.json(data);

        } else {
            res.json(data);
        }
    });
})

// end delete User





// add blog

adminRoutes.route('/addBlog').get((req, res) => {
    authControllers.getCategories((ok, result) => {
        if (ok) {
            console.log(result);
            res.render('addBlog', { result, user: req.session.user });
        } else {
            res.send(result);
        }

    })

});




adminRoutes.route('/addBlog').post((req, res) => {
    let photosArr = [];
    for (let i = 0; i < req.files.length; i++) {
        photosArr.push(req.files[i].destination.replace("./public", "")   // replace ./public with nothing    Z.B (/public/admin/auth =>  /admin/auth)
            + req.files[i].filename);
    }
    authControllers.addBlog(
        req.body.titleInput,
        req.body.keywordsInput,
        req.body.descTextarea,
        req.body.categorySelect,
        req.body.newCategory,
        true,
        req.session.user._id,   // ---> this is the one costas changed
        //req.session.user.firstName,
        photosArr, (result) => {  // for created by

            authControllers.getCategories((ok, result) => {
                if (ok) {
                    console.log(result);
                    res.render('addBlog', { result, user: req.session.user });
                } else {
                    res.send(result);
                }
            })
        }
    );
});

//end add blog






// get all blogs

adminRoutes.route('/blogsmanag').get((req, res) => {
    if (req.session.user.userType == "admin") {
        endUserControllers.getBlogs((ok, result) => {
            if (ok) {
                authControllers.getCategories((ok, categories) => {
                    if (ok) {
                        res.render('blogsmanag', { result, user: req.session.user, categories });
                    } else {
                        res.send(categories);
                    }

                });

            } else {
                res.send(result);
            }

        });
    } else {
        endUserControllers.getadminBlogs(req.session.user._id, (ok, result) => {
            if (ok) {
                authControllers.getCategories((ok, categories) => {
                    if (ok) {
                        res.render('blogsmanag', { result, user: req.session.user, categories });
                    } else {
                        res.send(categories);
                    }

                });
            } else {
                res.send(result);
            }

        });
    }


});

//  end  get all blogs





// This route to delete Blog

adminRoutes.post("/delete", (req, res) => {
    authControllers.updateDatabase(dbUrl, dbName, "Blogs", req.body.ID, {
        exist: false
    }, (ok, data) => {
        if (ok) {
            res.json(data);

        } else {
            res.json(data);
        }
    });
})

// end delete Blog





// update Blog info

adminRoutes.post("/bloginfo", (req, res) => {
    authControllers.updateDatabase(dbUrl, dbName, "Blogs", req.body.ID, {
        title: req.body.title,
        keyWords: req.body.keyWords,
        description: req.body.description,
        category: req.body.categorySelect
        // imgUrl: req.body.
        // :req.body.newCategory


    }, (ok, data) => {
        if (ok) {
            res.json(data);

        } else {
            res.json(data);
        }
    });
});

//  end update Blog info








// update blog 

adminRoutes.post("/blogsedite", (req, res) => {
    // let photosArr = [];
    // for (let i = 0; i < req.files.length; i++) {
    //     photosArr.push(req.files[i].destination.replace("./public","")   // replace ./public with nothing    Z.B (/public/admin/auth =>  /admin/auth)
    //     +req.files[i].filename);
    // }

    authControllers.changeBlogInfo(req.body.ID, req.body.titleInput, req.body.keywordsInput, req.body.descTextarea, req.body.categorySelect, req.body.newCategory, (result) => {
        authControllers.getCategories((ok, result) => {
            if (ok) {
                // console.log(result);
                res.json(result);
                // res.render('addBlog',{result,user:req.session.user});
            } else {
                res.json(result);
            }
        })
        //    if(ok){
        //        res.json(data);

        //    }else{
        //        res.json(data);
        //    }
    });
});

//  end update blog info








// adminRoutes.route('/blogsedite/:id').get((req, res)=>{
//     const blogId = req.params.id;
// authControllers.getBlog(blogId,(chekBlog, blog)=>{

//     if(chekBlog){
//     authControllers.getCategories((ok, categories)=>{
//         if(ok){
//             res.render('blogsedite',{categories, blog});   // we pass two thing categories and adv
//         }else{
//             res.send(result);
//         }
//     });
// }else{
//     res.send(blog);
// }



// });

// });








// adminRoutes.route('/userinfo/:id').get((req, res)=>{
//     var blogId = req.params.id;
//     // console.log(blogId);
//     // console.log(userid)
// authControllers.getUser(blogId,(chekBlog, blog)=>{

//     if(chekBlog){
//         res.render('userinfo',{blog,user:req.session.user})

//         // if(blogId ===req.session.user._id){
//         //     res.redirect('userpersonalinfo')
//         // }else{
//             adminRoutes.route('/userinfo/:id').post((req, res) => {

//                 console.log(blogId)

//                  authControllers.changePersonalInfo(blogId, req.body.firstName,req.body.lastName,req.body.dateOfBirth,req.body.chooseUserName,req.body.phoneNumber,req.body.passwordname, (result) => {
//                      console.log(result)

//                     //  req.session.destroy();
//                      res.send('DDDOOONNNEEE')
//                  })
//              });
//         // }



//     }else{
//         res.send(blog)
//     }


// });

// });




module.exports = adminRoutes;