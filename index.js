const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const passport = require('passport');
//bring all routes here
const auth = require('./routes/api/auth');



//Middleware for bodyparser
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

//Passport middlewar
app.use(passport.initialize());

//Config for jwt Strategy
require('./strategies/jsonjwtstrategy')(passport);


//mongoDB Configuration
const db = require('./setup/myurl').myURL;
//connecting to mongoDB
mongoose
    .connect(db)
    .then(() => console.log("MongoDB connected Successfully..."))
    .catch(error => console.log(error));

//actual routes
app.use("/api/auth", auth);




//server configuration
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server is running at port ${port}...`));