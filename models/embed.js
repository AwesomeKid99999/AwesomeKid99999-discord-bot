

module.exports = (sequelize, Sequelize) => {
    return sequelize.define('embed', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        serverId: {
            type: Sequelize.STRING,
            allowNull: false
        },
        embedName: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
        },
        authorText: {
            type: Sequelize.STRING,
            allowNull: true
        },
        authorImage: {
            type: Sequelize.STRING,
            allowNull: true
        },
        title: {
            type: Sequelize.STRING,
            allowNull: true
        },
        description: {
            type: Sequelize.STRING,
            allowNull: true
        },
        thumbnail: {
            type: Sequelize.STRING,
            allowNull: true
        },
        image: {
            type: Sequelize.STRING,
            allowNull: true
        },
        footerText: {
            type: Sequelize.STRING,
            allowNull: true
        },
        footerImage: {
            type: Sequelize.STRING,
            allowNull: true
        },

        color: {
            type: Sequelize.STRING,
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