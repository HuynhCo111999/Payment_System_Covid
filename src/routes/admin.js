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

router.get('/getAllAccount', authController.testGetAllAccounts);

router.get('/accounts', authController.getAllAccounts);

router.get('/getDetailAccount', authController.getDetailAccount)


module.exports = router;