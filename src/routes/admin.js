const express = require('express');
const router = express.Router();
const { verifySignUp, authJwt } = require("../middleware");
const authController = require("../controllers/auth.controller");
const UserController = require("../controllers/user.controller")


router.get('/users', UserController.getAllUsers);
router.post('/createUser', 
  [
    verifySignUp.checkDuplicateUsernameOrEmail,
    verifySignUp.checkRolesExisted,
  ], 
  authController.signup
);

router.post('/createAccount', [
    verifySignUp.checkDuplicateUsernameOrEmail,
    verifySignUp.checkRolesExisted,
  ], 
  authController.createAcc
);


module.exports = router;