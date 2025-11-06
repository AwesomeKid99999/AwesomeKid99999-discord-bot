const Sequelize = require('sequelize');

// const sequelize = new Sequelize('database', 'user', 'password', {
// dialect: 'sqlite',
// host: 'localhost',
//
// storage: 'database.sqlite',
// logging: false,
// });

const sequelize = new Sequelize(process.env.DATABASE_NAME, process.env.DATABASE_USER, process.env.DATABASE_PASSWORD, {
    dialect: 'mysql',
    // dialectOptions: {ssl: {require: true}},
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    define: {
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
        timestamps: true // if your models use createdAt/updatedAt
    }
});

module.exports = sequelize;