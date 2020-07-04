'use strict';
module.exports = (sequelize, DataTypes) => {
  const comment = sequelize.define('comment', {
    userId: DataTypes.INTEGER,
    earthquakeId: DataTypes.INTEGER,
    text: DataTypes.TEXT
  }, {});
  comment.associate = function(models) {
    // associations can be defined here
    models.comment.belongsTo(models.user);
    models.comment.belongsTo(models.earthquake);
  };
  return comment;
};