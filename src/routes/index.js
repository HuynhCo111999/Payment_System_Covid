const express = require('express');
const router = express.Router();
const controller = require("../controllers/auth.controller");



router.get('/', async(req, res) => {
    controller.checkfirst().then((isCheck) => {
        console.log('check:', isCheck);
        if(!isCheck) {
            return res.render('register', {
                layout: 'main'
            })
        } else {
            const access_token = req.cookies['access_token'];
            const role = req.cookies['role']
            if(!access_token) {
                return res.render('login',{
                    layout: 'main'
                });
            }
            else {
                if(role === "admin") {
                    res.render('admin/main', {
                        layout: 'admin/main'
                    }) 
                } else {
                    return res.redirect('/user')
                }
            }
        }
    })
});

router.get('/register', async(req, res) => {
    res.render('register', {
        layout: 'main'
    })
})

router.get('/logout', async(req, res) => {
    res.clearCookie("access_token");
    res.clearCookie("userId");
    res.clearCookie("userType");
    return res.redirect('/');
})

router.get('/connectsystem', controller.getConnectSystem);

router.post('/connectTwoSystem', controller.connectPayment);

module.exports = router;