
const db = require('../models');
const User = db.user;

exports.getAllUsers = async (req, res) => {
  const listUsers = await User.findAll({ raw: true });
  console.log("listUsers: ", listUsers)
  res.render('admin/listUser', {
    layout: 'admin/main',
    listUsers: listUsers,
  });
}