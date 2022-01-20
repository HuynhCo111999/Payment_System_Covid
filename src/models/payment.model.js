module.exports = (sequelize, Sequelize) => {
    const Payment = sequelize.define("payment", {
        money: {
            type: Sequelize.INTEGER,
        },
        position: {
            type: Sequelize.STRING,
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
