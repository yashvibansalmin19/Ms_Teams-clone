'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Room extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ User, Message }) {
      // define association here
      this.belongsTo(User)
      this.hasMany(Message)
    }
  };
  Room.init({
    room_id: DataTypes.STRING
  }, {
    sequelize,
    tableName: "rooms",
    modelName: 'Room',
  });
  return Room;
};