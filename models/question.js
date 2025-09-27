

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
        QuestionType: {
            type: Sequelize.STRING,
            allowNull: false
        },
        QuestionEmbedId: {
            type: Sequelize.STRING,
            allowNull: true
        },
        questionText: {
            type: Sequelize.STRING,
            allowNull: true
        },
        questionImage: {
            type: Sequelize.STRING,
            allowNull: true
        },
    }, {
        timestamps: true,
    });
}