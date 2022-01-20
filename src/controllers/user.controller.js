
const db = require('../models');
const User = db.user;
const Wallet = db.wallet;
var bcrypt = require("bcryptjs");
const { use } = require('passport');

exports.getAllUsers = async (req, res) => {
  const listUsers = await User.findAll({ raw: true });
  console.log("listUsers: ", listUsers)
  res.render('admin/listUser', {
    layout: 'admin/main',
    listUsers: listUsers,
  });
}

exports.getUserInfo = async (req, res) => {
  const userId = req.cookies['userId'];
  const userInfo = await User.findOne({
    raw: true,
    where: {
      id: userId
    }
  })
  const wallet = await Wallet.findOne({
    raw: true,
    where: {
      id: userId
    }
  })
  const data = {...userInfo,...wallet};
  console.log("User Info: ", data);
  res.render('user/userInfo', {
    layout: 'user/main',
    userInfo: data,
  });
}

exports.getInfoAccount = async (req, res) => {
  const userId = req.body.userId;
  const userInfo = await User.findOne({
    raw: true,
    where: {
      id: userId
    }
  })
  const wallet = await Wallet.findOne({
    raw: true,
    where: {
      id: userId
    }
  })
  const data = {...userInfo,...wallet};
  console.log("User Info: ", data);
  if(userInfo && wallet) {
    return res.json({
      success: true,
      data: data
    })
  }
  else {
    return res.json({
      success: false,
      error: "error."
    })
  }
  
}

exports.resetPassword = async(req, res) => {
  console.log("req body: ", req.body)
  let inputPwd = req.body.password;
  let inputNewPwd = req.body.newPassword;
  let inputConfirmPwd = req.body.confirmPassword;
  const userId = req.cookies['userId'];
  let flag = false;
  let errMsg1 = '';
  let errMsg2 = '';
  let errMsg3 = '';

  User.findOne({
    raw: true,
    where: {
      id: userId
    }
  }).then((user) => {
    console.log("user reset: ", user);
    const passwordIsValid = bcrypt.compareSync(
      inputPwd,
      user.password
    );
    if (inputPwd.length < 6) {
      errMsg1 = 'Vui lòng nhập tối thiểu 6 ký tự';
      flag = true;
    } else {
      if (!passwordIsValid) {
          errMsg1 = 'Mật khẩu không chính xác';
          flag = true;
      }
    }
    if (inputNewPwd.length < 6) {
      errMsg2 = 'Vui lòng nhập tối thiểu 6 ký tự';
      flag = true;
    }

    if (inputConfirmPwd.length < 6) {
        errMsg3 = 'Vui lòng nhập tối thiểu 6 ký tự';
        flag = true;
    } else {
        if (inputNewPwd !== inputConfirmPwd) {
            errMsg3 = 'Mật khẩu không khớp';
            flag = true;
        }
    }

    if (flag == true) {
      res.render("user/changePassword", {
          layout: "user/main",
          someData: 'Thay đổi thông tin cá nhân',
          errMsg1: errMsg1,
          errMsg2: errMsg2,
          errMsg3: errMsg3,
          value1: inputPwd,
          value2: inputNewPwd,
          value3: inputConfirmPwd,
      });
      return;
    }
    const updatePwd = bcrypt.hashSync(inputNewPwd, 8);

    console.log('updatePwd: ', updatePwd)

    User.update({
        password: bcrypt.hashSync(inputNewPwd, 8),
    }, {
        where: { id: userId }
    }).then((data) => {
      if(data) {
        res.redirect('/user/infoAccount');
      }
    })
  })
};

exports.getChangePassword = async (req, res) => {
  return res.render("user/changePassword", {
    layout: "user/main",
    function: "change-information",
    someData: 'Thay đổi thông tin cá nhân',
  });
}