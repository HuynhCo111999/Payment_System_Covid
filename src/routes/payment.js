const express = require('express');
const router = express.Router();
const controller = require("../controllers/payment.controller");


router.post("/recharge", controller.rechargeAndDebit);

router.post("/identify", controller.identify);

router.post("/payment", controller.payment);

module.exports = router;



