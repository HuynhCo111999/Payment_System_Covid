const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Role = db.role;
const Wallet = db.wallet;
const Setting = db.setting;
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
      Wallet.create({
        positive: 0,
        negative: 0,
        userId: user.id
      }).then(() => {
        console.log("create wallet success")
      }).catch((e) => {
        console.log("create wallet error: ", e)
      })
      Setting.create({
        limitcredit: 0
      }).then(() => {
        console.log("create wallet success")
      }).catch((e) => {
        console.log("create wallet error: ", e)
      })
      if (req.body.roles) {
        Role.findAll({
          where: {
            name: {
              [Op.or]: req.body.roles
            }
          }
        }).then(roles => {
          user.setRoles(roles).then(() => {
            return res.render('login',{
              layout: 'main'
            });
          });
        });
      } else {
        // user role = 1
        user.setRoles([1]).then(() => {
          return res.render('login',{
            layout: 'main'
          });
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

      var token = jwt.sign({ id: user.id, username: user.username }, config.secret, {
        expiresIn: 86400 // 24 hours
      });
      
      
      user.getRoles().then(roles => {
        for (let i = 0; i < roles.length; i++) {
          if(roles[i].name.toUpperCase() === "ADMIN") {
            res.cookie("access_token", token);
            res.cookie("userId", user.id);
            res.cookie("userType", 'admin');
            return res.redirect('/admin/accounts');
          }
          else {
            res.cookie("access_token", token);
            res.cookie("userId", user.id);
            res.cookie("userType", 'user');
            return res.redirect('/user/infoAccount');
          }
        }
      });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.createAcc = (req, res) => {
  User.create({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8)
  })
    .then(user => {
      Setting.create({
        limitcredit: 0
      }).then(() => {
        console.log("create wallet success")
      }).catch((e) => {
        console.log("create wallet error: ", e)
      })
      Wallet.create({
        positive: 0,
        negative: 0,
        userId: user.id
      }).then(() => {
        console.log("create wallet success")
      }).catch((e) => {
        console.log("create wallet error: ", e)
      })
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

exports.getAllAccounts = async(req, res) => {
  let listAccounts = await User.findAll(
    { 
      raw: true,
      include: [
        {
          model: Role,
          attributes: ['name']
        }
      ]
    }, 
  );
  let dataWallet = await Wallet.findOne({
    raw: true,
    where: {
      userId: req.cookies['userId']
    }
  })
  let filterAccounts = await listAccounts.filter(item => item["roles.name"] === 'user');
  console.log("filterAccounts: ", filterAccounts, dataWallet);
  return res.render('admin/listAccounts', {
    layout: 'admin/main',
    listAccounts: filterAccounts,
    dataWallet: dataWallet
  });
}

exports.testGetAllAccounts = (req, res) => {
  User.findAll(
    {
      raw: true,
      include: [
        {
          model: Role,
          attributes: ['name'],
          required: true
        }
      ]
    }
  ).then(users => {
    const resultUser = users.map(u=>({
      ...u,
      role: u["roles.name"]
    }))
    res.json({
      success: true,
      data: resultUser
    })
  }).catch((error) => {
    res.json({
      success: false,
      error: error
    })
  })
}

exports.checkfirst = async() => {
  let users = await User.findAll();
  console.log("users: ", users);
  if(!users || users.length === 0) return false;
  return true;
}

exports.getDetailAccount = async(req, res) => {
  const id = req.query.id;
  const user = await User.findOne({
    raw: true,
    where: {
      id: id
    }
  })
  const wallet = await Wallet.findOne({
    raw: true,
    where: {
      userId: id
    }
  })
  if(user && wallet) {
    return res.json({
      success: true,
      data: {...user,...wallet}
    })
  }
  return res.json({
    success: false,
    error: 'Not know.'
  })
}

exports.getConnectSystem = async(req, res) => {
  const token = req.query.token;
  return res.render('admin/connectSystem', {
    token: token
  })
}

exports.connectPayment = async(req, res) => {
  const token = req.query.token;
  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Unauthorized!"
      });
    }
    console.log("decoded: ", decoded)
    User.findOne({
      raw: true,
      include: [
        {
          model: Role
        }
      ],
      where: {
        username: decoded.username
      }
    }).then((user) => {
      console.log(user)
      if(user["roles.name"] === "user") {
        res.cookie("access_token", token);
        res.cookie("userId", user.id);
        res.cookie("userType", 'user');
        return res.redirect('/user/infoAccount');
      } else {
        res.cookie("access_token", token);
        res.cookie("userId", user.id);
        res.cookie("userType", 'admin');
        return res.redirect('/admin/accounts');
      }
    }).catch((error) => {
      return res.json({error})
    })
  });
}

exports.getSetting = async(req, res) => {
  const setting = await Setting.findOne({raw: true});
  if(setting) {
    return res.json({
      success: true,
      data: setting
    })
  }
  return res.json({
    success: false,
    error: "erorr"
  })
}

exports.updateSetting = async(req, res) => {
  console.log("update setting: ", req.body);
  if(req.body.limitcredit < 0) {
    return res.json({
      success: false,
      error: "Limit credit > 0, please check!"
    })
  }
  const update = await Setting.update({
    limitcredit: req.body.limitcredit},{
    where: {
      id: 1
    }
  })
  if(update) {
    const setting = await Setting.findOne({raw: true});
    if(setting) {
      return res.json({
        success: true,
        data: setting
      })
    }
  }
  return res.json({
    success: false,
    error: "erorr"
  })
}
