const { DataTypes, HasMany } = require('sequelize');

module.exports = (sequelize) => {
    const Message = sequelize.define('message', {
        text: DataTypes.STRING,
    })

    Message.associate = (models) => {
        Message.belongsTo(models.Room, {
            foreignKey: 'roomId',
        });
        Message.belongsTo(models.User, {
            foreignKey: 'userId',
        });
    };

    return Message;
};