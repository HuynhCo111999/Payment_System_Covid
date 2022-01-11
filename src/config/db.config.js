module.exports = {
    HOST: "localhost",
    USER: "postgres",
    PASSWORD: "082323092015",
    DB: "qlcovid19",
    dialect: "postgres",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  };