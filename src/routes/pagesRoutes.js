const express = require('express');
const emaiVerifier = require('../controllers/emailVerfiy');
// const authControllers=require('../controllers/authControllers');
const endUserControllers = require('../controllers/endUserControllers');
const pagesRoutes = express.Router();
pagesRoutes.route('/').get((req, res) => {
    endUserControllers.getBlogs((ok, result) => {   // (ok,result) this is callback function called done(true,data),done(false,error.message)  that means done take two parameter (see that in endusercontroller)
        if (ok) {
            //ccheck session
            if (req.session.user) {
                res.render('index', { result, user: req.session.user });
            } else {
                res.render('index', { result, user: undefined });
            }

        } else {
            res.send(result);
        }

    });

});


// verify
pagesRoutes.route('/verify').get(function (req, res) {
    let verifyNumber = req.param("id");
    emaiVerifier.verfyEmail(verifyNumber, (user) => {
        if (user) {
            res.send("Hello " + user.firstName + " " + user.lastName + ", your Email is verified. Please go to your profile <a href='./admin'>Login</a>")
        } else {
            res.send("this link is not valid ");
        }
    });
});

// end verify


//contact 
pagesRoutes.route('/contact').get((req, res) => {
    res.render('contact', { user: undefined });
});

pagesRoutes.route('/registersuccess').get((req, res) => {
    res.render('registersuccess')
})

pagesRoutes.route('/single-post').get((req, res) => {
    res.render('single-post')
})

module.exports = pagesRoutes;