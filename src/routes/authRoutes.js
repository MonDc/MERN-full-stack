const express = require('express');

// const expressValidator=require('express-validator');
const authControllers = require('../controllers/authControllers');
const authRoutes = express.Router();




// register 

authRoutes.route('/register').get((req, res) => {
    res.render('register', { user: false })

});


authRoutes.route('/register').post((req, res) => {
    if (!req.body.firstName || !req.body.lastName || !req.body.dateOfBirth || !req.body.gender || !req.body.chooseUserName || !req.body.emailname || !req.body.phoneNumber || !req.body.passwordname) {
        res.redirect("/");
    } else {

        authControllers.addUser(req.body.firstName, req.body.lastName, req.body.dateOfBirth, req.body.gender, req.body.chooseUserName, req.body.emailname, req.body.phoneNumber, req.body.passwordname, true, req.host, (check) => {

            if (check) {
                req.session.user = check
                console.log(check);
                // was: req.session.username = req.body.emailname
                res.send("Please verify your Account then go to login page" + "<br><br><br>" + req.session.user._id);




            } else {
                // res.send(false);
                res.send("Sorry your Username or Email or Phone Number Exist in our database" + "<br>" + "Please Try another one");
            }
        });
    }

});

// end register 




// authRoutes.route('/register').get((req,res,next)=>{
//     res.render('register',{userExist:false,success:false});
//     // res.render('register',{userExist:false,success:req.session.success,errors:req.session.errors});
//     // req.session.errors=null;
// });



// authRoutes.route('/register').post((req, res,next) => {
//     authControllers.addUser(req.body.firstName, req.body.lastName, req.body.dateOfBirth, req.body.gender, req.body.chooseUserName, req.body.emailname, req.body.phoneNumber, req.body.passwordname, active = false, verify = false, (check) => {

//         req.check('emailname','Invalid email address').isEmail();
//         req.check('passwordname','Password is Invalid').isLength({min:4}).equals(req.body.confirmPassword);


//         var errors =req.validationErrors();
//         if(errors){
//             req.session.errors=errors;
//             req.session.success=false;
//         } else{
//                 req.session.success=true;
//             }

//             res.redirect('/')





//         if (check) {

//                 req.session.chooseUserName = req.body.chooseUserName
//                 // was: req.session.username = req.body.emailname
//                 res.redirect('/userAdmin')
//                 // res.redirect('/admin')


//         } else {
//             res.render('register',{userExist:true})
//         }
//     })
// });





// login

authRoutes.route('/login').get((req, res) => {
    if (!req.session.user) {
        res.render('login', { user: undefined });
    } else {
        res.redirect('/admin', { user: req.session.user })
    }
});

authRoutes.route('/login').post((req, res) => {
    authControllers.checkUserforlogin(req.body.userNameloginname, req.body.passwordloginname, (user) => {
        if (user && user.active && user.verify) { // this is the user comming from the function checkUserforlogin in callback(user)
            //console.log(active); this consol in this point breaks out the funciton why ????

            req.session.user = user; // this user is all the object that comes in session
            res.redirect('/admin');
            // if (user.active) {
            //     req.session.usertype = "admin";
            //     res.redirect('/admin');
            // } else {
            //     req.session.usertype = "user";
            //     res.redirect('/userAdmin')
            // }

            //res.redirect('/userAdmin');
        } else {
            res.render('login', { user: true })
        }

    });

});

// end login



//logout

authRoutes.route('/logout').get((req, res) => {
    req.session.destroy();
    res.redirect('/');
    // res.redirect('/')

    // ahmad version was like this:
    //res.redirect('/'); this will will redirect me to the main page ('/')=(index.ejs)
    // the destryo will never work if u didn't aim it to /auth/logout in the admin.ejs file(in <a href=""). 
    //otherwise it will never work,
    // one other point is if u have here res.redirect('/logout), the destruction of the session will actually take place, but 
    // it will then redirect me to a page without route
});

// end logout

module.exports = authRoutes;