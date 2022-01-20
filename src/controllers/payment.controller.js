const position = require("../config/position.config")
const db = require("../models");
const config = require("../config/auth.config");
const uuid = require("uuid");
const User = db.user;
const Role = db.role;
const Wallet = db.wallet;
const Setting = db.setting;
const Payment = db.payment;

exports.rechargeAndDebit = async(req, res) => {
    const body = req.body;  
    console.log("body:", body);
    Payment.create({
        money: req.body.money,
        position: req.body.position,
        status: req.body.status,
        tokenpayment: uuid.v4(),
        userId: req.body.userId
    }).then((payment) => {
        return res.json({
            success: true,
            data: payment
        })
    }).catch((error) => {
        return res.json({
            success: false,
            error: error
        })  
    })
}

exports.payment = async(req, res) => {
    const body = req.body;  
    const setting = await Setting.findOne({raw: true});
    console.log("setting: ", setting);

    const dataWallet = await Wallet.findOne({
        raw: true,
        userId: body.userId
    })
    if(dataWallet) {
        if(limitcredit > body.money) {
            return res.json({
                success: false,
                error: "Không đủ hạn mức thanh toán."
            })  
        } else if(dataWallet.positive < body.money) {
            return res.json({
                success: false,
                error: "Tài khản không đủ tiền để thanh toán."
            })  
        } else {
            Payment.create({
                money: req.body.money,
                position: req.body.position,
                status: req.body.status,
                tokenpayment: uuid.v4(),
                userId: req.body.userId
            }).then((payment) => {
                return res.json({
                    success: true,
                    data: payment
                })
            }).catch((error) => {
                return res.json({
                    success: false,
                    error: error
                })  
            })
        }
    }
    return res.json({
        success: false,
        erorr: "error"
    })
}

exports.identify = async(req, res) => {
    const body = req.body;
    const payment = await Payment.findOne({
        raw: true,
        where: {
            tokenpayment: body.token
        }
    })
    if(!payment) {
        return res.json({
            success: false,
            erorr: "error"
        })
    } else {
        const dataWallet = await Wallet.findOne({
            raw: true,
            userId: body.userId
        })
        if(dataWallet) {
            if(body.postion === position.RECHARGE) {
                const wallet = await Wallet.update({
                    positive: body.money + dataWallet.positive
                }, {
                    where: {
                        userId: body.userId
                    }
                })
                if(wallet) {
                    return res.json({
                        success: true,
                        data: wallet
                    })
                }
                return res.json({
                    success: false,
                    erorr: "error"
                })
            } else if(body.position === position.PAYMENT) {
                const wallet = await Wallet.update({
                    positive:  dataWallet.positive - body.money
                }, {
                    where: {
                        userId: body.userId
                    }
                })
                if(wallet) {
                    return res.json({
                        success: true,
                        data: wallet
                    })
                }
                return res.json({
                    success: false,
                    erorr: "error"
                })
            } else {
                const wallet = await Wallet.update({
                    negative:  dataWallet.regative + body.money
                }, {
                    where: {
                        userId: body.userId
                    }
                })
                if(wallet) {
                    return res.json({
                        success: true,
                        data: wallet
                    })
                }
                return res.json({
                    success: false,
                    erorr: "error"
                })
            }
        }
        else {
            return res.json({
                success: false,
                erorr: "error"
            })
        }
    }
}
