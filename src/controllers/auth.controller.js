const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Role = db.role;

const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup = (req, res) => {
  // Save User to Database
  req.body.roles = ['admin'];
  User.create({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8)
  })
    .then(user => {
      if (req.body.roles) {
        Role.findAll({
          where: {
            name: {
              [Op.or]: req.body.roles
            }
          }
        }).then(roles => {
          user.setRoles(roles).then(() => {
            req.flash("success_msg", "Register success!")
            res.redirect('/register');
          });
        });
      } else {
        // user role = 1
        user.setRoles([1]).then(() => {
          req.flash("success_msg", "Register success!")
          res.redirect('/register');
        });
      }
    })
    .catch(err => {
      let error = "Register Error!"
      let username = req.body.username;
      let email = req.body.email;
      let password = req.body.password;
      res.render('register', {
        error,
        username,
        email,
        password
      })
    });
};

exports.signin = (req, res) => {
  console.log("req: ", req.body);
  if(!req.body.username || !req.body.password) {
    return res.render('login', {
      error: 'Field Required!'
    })
  }

  User.findOne({
    where: {
      username: req.body.username
    }
  })
    .then(user => {
      console.log("user: ", user);
      if (!user) {
        // return res.status(404).send({ message: "User Not found." });
        return res.render('login', {
          error: 'Account not found.'
        });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        // return res.status(401).send({
        //   accessToken: null,
        //   message: "Invalid Password!"
        // });
        return res.render('login', {
          error: 'Password invalid.'
        })
      }

      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400 // 24 hours
      });
      
      
      user.getRoles().then(roles => {
        for (let i = 0; i < roles.length; i++) {
          if(roles[i].name.toUpperCase() === "ADMIN") {
            res.cookie("access_token", token);
            res.cookie("userId", user.id);
            res.cookie("userType", 'admin');
            return res.redirect('/');
          }
          else {
            res.cookie("access_token", token);
            res.cookie("userId", user.id);
            res.cookie("userType", 'user');
            return res.redirect('/user');
          }
        }
      });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.createAcc = (req, res) => {
  // req.body.roles = ['user'];
  User.create({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8)
  })
    .then(user => {
      if (req.body.roles) {
        Role.findAll({
          where: {
            name: {
              [Op.or]: req.body.roles
            }
          }
        }).then(roles => {
          user.setRoles(roles).then(() => {
            return res.json({
              success: true,
              data: user
            })
          });
        });
      } else {
        // user role = 1
        user.setRoles([1]).then(() => {
          return res.json({
            success: true,
            data: user
          })
        });
      }
    })
    .catch(err => {
      res.json({
        success: false,
        error: err
      })
    });
}
