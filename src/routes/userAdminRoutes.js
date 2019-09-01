// const express = require('express');
// const multer = require('multer');
// const authControllers = require('../controllers/authControllers');
// const userAdminRoutes = express.Router();


// userAdminRoutes.use((req, res, next) => {
//     if (req.session.usertype === "user" || req.session.usertype === "admin") {
//         next();
//     } else {
//         res.redirect('/auth/login')
//     }
// });

// userAdminRoutes.route('/').get((req, res) => {
//     res.render('userAdmin')
// });

// module.exports = userAdminRoutes;