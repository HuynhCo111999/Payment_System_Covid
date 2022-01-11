const db = require("../models");
const ROLES = db.ROLES;
const User = db.user;

checkDuplicateUsernameOrEmail = (req, res, next) => {
  // Username
  console.log("hello");
  User.findOne({
    where: {
      username: req.body.username
    }
  }).then(user => {
    if (user) {
      let error = "Failed! User is already in use!";

      res.status(400).send({
        success: false,
        message: error
      })
      return;
    }

    // Email
    User.findOne({
      where: {
        email: req.body.email
      }
    }).then(user => {
      if (user) {
        let error = "Failed! Email is already in use!";
        res.status(400).send({
          success: false,
          message: error
        })
        
        return;
      }

      next();
    });
  });
};

checkRolesExisted = (req, res, next) => {
  if(!req.body.roles) {
    req.body.roles = ["user"];
  }
  if (req.body.roles) {
    for (let i = 0; i < req.body.roles.length; i++) {
      if (!ROLES.includes(req.body.roles[i])) {
        res.status(400).send({
          message: "Failed! Role does not exist = " + req.body.roles[i]
        });
        return;
      }
    }
  }
  
  next();
};

const verifySignUp = {
  checkDuplicateUsernameOrEmail: checkDuplicateUsernameOrEmail,
  checkRolesExisted: checkRolesExisted
};

module.exports = verifySignUp;
