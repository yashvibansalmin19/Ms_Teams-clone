'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Room, Message }) {
      // define association here
      this.hasMany(Message)
      this.hasMany(Room)
    }
  };
  User.init({
    google_id: DataTypes.STRING,
    username: DataTypes.STRING
  }, {
    sequelize,
    tableName: "users",
    modelName: 'User',
  });
  return User;
};