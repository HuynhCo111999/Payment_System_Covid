module.exports = (sequelize, Sequelize) => {
    const Setting = sequelize.define("setting", {
      limitcredit: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      }
    });
  
    return Setting;
  };
  