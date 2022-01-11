const express = require('express');
const router = express.Router();



router.get('/', async(req, res) => {
    const access_token = req.cookies['access_token'];
    if(!access_token) {
        res.render('login',{
            layout: 'main'
        });
    }
    else {
        res.render('admin/main', {
            layout: 'admin/main'
        }) 
    }
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


module.exports = router;