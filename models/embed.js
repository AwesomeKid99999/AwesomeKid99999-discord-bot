

module.exports = (sequelize, Sequelize) => {
    return sequelize.define('embed', {
        id: {
            type: Sequelize.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        serverId: {
            type: Sequelize.STRING(20),
            allowNull: false
        },
        embedName: {
            type: Sequelize.STRING(100),
            allowNull: false,
            unique: true,
        },
        authorText: {
            type: Sequelize.STRING(256),
            allowNull: true
        },
        authorImage: {
            type: Sequelize.STRING(2048),
            allowNull: true
        },
        title: {
            type: Sequelize.STRING(256),
            allowNull: true
        },
        description: {
            type: Sequelize.STRING(4096),
            allowNull: true
        },
        thumbnail: {
            type: Sequelize.STRING(2048),
            allowNull: true
        },
        image: {
            type: Sequelize.STRING(2048),
            allowNull: true
        },
        footerText: {
            type: Sequelize.STRING(2048),
            allowNull: true
        },
        footerImage: {
            type: Sequelize.STRING(2048),
            allowNull: true
        },

        color: {
            type: Sequelize.STRING(9),
            allowNull: true
        },
        timestamp: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        },
        isActive: {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
        },

    });
}