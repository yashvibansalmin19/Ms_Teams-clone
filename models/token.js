const { DataTypes, HasMany } = require('sequelize');

module.exports = (sequelize) => {
    const Token = sequelize.define('token', {
        token: {
            type: DataTypes.STRING,
            unique: true,
        }
    });

    return Token;
};