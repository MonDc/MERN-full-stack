const express = require('express');
const path = require('path');
// const expressValidator=require('express-validator');
const app = express();
const session = require('express-session');
const pagesRoutes = require('./src/routes/pagesRoutes')
const authRoutes = require('./src/routes/authRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
// const userAdminRoutes = require('./src/routes/userAdminRoutes');
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));

// app.use(expressValidator());

app.use(express.static(path.join(__dirname, '/public')));
app.use(session({ secret: 'nodeJsProject' }));


app.set('views', path.join(__dirname, '/src/views'));
app.set('view engine', 'ejs')


app.use('/', pagesRoutes);
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
// app.use('/userAdmin', userAdminRoutes);


app.listen(port, () => {
    console.log(`App listening on port ${port}!`);
});