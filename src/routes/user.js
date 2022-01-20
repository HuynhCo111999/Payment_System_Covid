const express = require('express');
const router = express.Router();
const userControlller = require("../controllers/user.controller");


router.get('/infoAccount', userControlller.getUserInfo);

router.post('/resetPassword', userControlller.resetPassword);

router.get('/getRessetPassword', userControlller.getChangePassword);

router.post('/getInfoAccount', userControlller.getInfoAccount);

module.exports = router;