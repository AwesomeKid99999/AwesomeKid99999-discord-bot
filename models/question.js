

module.exports = (sequelize, Sequelize) => {
    return sequelize.define('question', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        serverId: {
            type: Sequelize.STRING,
            allowNull: false
        },
        questionNumber: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        questionText: {
            type: Sequelize.STRING,
            allowNull: false
        },
    }, {
        timestamps: true,
    });
}