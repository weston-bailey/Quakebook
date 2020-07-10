'use strict';
module.exports = (sequelize, DataTypes) => {
  const reply = sequelize.define('reply', {
    userId: DataTypes.INTEGER,
    earthquakeId: DataTypes.INTEGER,
    commentId: DataTypes.INTEGER,
    userName: DataTypes.STRING,
    text: DataTypes.TEXT
  }, {});
  reply.associate = function(models) {
    // associations can be defined here
    models.reply.belongsTo(models.user);
    models.reply.belongsTo(models.earthquake);
    models.reply.belongsTo(models.comment);
  };
  return reply;
};