const { DataTypes, HasMany } = require('sequelize');

module.exports = (sequelize) => {
    const Room = sequelize.define('room', {
        roomId: DataTypes.STRING,
    });

    return Room;
};