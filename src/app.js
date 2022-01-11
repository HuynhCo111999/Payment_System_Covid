const express = require('express');
const app = express();
const { engine } = require('express-handlebars');
const bodyParser = require("body-parser");
const path = require('path');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');

require('dotenv').config()
//set port local
const port = process.env.PORT || 3001;

// parse requests of content-type - application/json
app.use(bodyParser.json());


//

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());
// database
const db = require("./models");
const Role = db.role;

// db.sequelize.sync();
// force: true will drop the table if it already exists
db.sequelize.sync({force: true}).then(() => {
  console.log('Drop and Resync Database with { force: true }');
  initial();
});

app.engine('handlebars', engine());
app.set('view engine', 'handlebars')
app.set('views', path.join(__dirname, 'views'));


// Express session
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

//As Routes are defined in pages.js
app.use('/', require('./routes/index'));
app.use('/admin', require('./routes/admin'));
app.use(express.static(__dirname + '/public'));
require('./routes/auth.routes')(app);


app.listen(port, () => {
    console.log(`Server started on port: ${port}`);
})

function initial() {
    Role.create({
      id: 1,
      name: "user"
    });
   
    Role.create({
      id: 2,
      name: "admin"
    });
  }