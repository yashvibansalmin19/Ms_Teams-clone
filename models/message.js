'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ User, Room }) {
      // define association here
      this.belongsTo(User)
      this.belongsTo(Room)
    }
  };
  Message.init({
    text: DataTypes.STRING
  }, {
    sequelize,
    tableName: "messages",
    modelName: 'Message',
  });
  return Message;
};