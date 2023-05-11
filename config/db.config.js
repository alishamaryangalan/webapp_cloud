module.exports = {
    HOST: "localhost",
    USER: "alisha",
    PASSWORD: "password",
    DB: "webappdb",
    dialect: "postgres",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
}