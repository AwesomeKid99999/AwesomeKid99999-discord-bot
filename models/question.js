

module.exports = (sequelize, Sequelize) => {
    return sequelize.define('question', {
        id: {
            type: Sequelize.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        serverId: {
            type: Sequelize.STRING(20),
            allowNull: false
        },
        questionNumber: {
            type: Sequelize.BIGINT,
            allowNull: false
        },
        QuestionType: {
            type: Sequelize.STRING(50),
            allowNull: false
        },
        QuestionEmbedId: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true
        },
        questionText: {
            type: Sequelize.STRING(1000),
            allowNull: true
        },
        questionImage: {
            type: Sequelize.STRING(2000),
            allowNull: true
        },
    }, {
        timestamps: true,
    });
}