module.exports = (sequelize, Sequelize) => {
    const Wallet = sequelize.define("wallets", {
      positive: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      negative: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      }
    });
  
    return Wallet;
  };
  