module.exports = (sequelize, Sequelize) => {
    const Payment = sequelize.define("payment", {
        money: {
            type: Sequelize.INTEGER,
          },
        status: {
            type: Sequelize.STRING,
        },
        tokenpayment: {
            type: Sequelize.STRING,
        }
    });
  
    return Payment;
  };
