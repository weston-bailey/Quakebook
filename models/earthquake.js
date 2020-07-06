'use strict';
module.exports = (sequelize, DataTypes) => {
  const earthquake = sequelize.define('earthquake', {
    usgsId: DataTypes.STRING,
    mag: DataTypes.FLOAT,
    place: DataTypes.STRING,
    time: DataTypes.FLOAT,
    url: DataTypes.STRING,
    felt: DataTypes.INTEGER,
    alert: DataTypes.STRING,
    status: DataTypes.STRING,
    tsunami: DataTypes.INTEGER,
    sig: DataTypes.INTEGER,
    title: DataTypes.STRING,
    latitude: DataTypes.FLOAT,
    longitude: DataTypes.FLOAT,
    depth: DataTypes.FLOAT
  }, {});
  earthquake.associate = function(models) {
    // associations can be defined here
    models.earthquake.hasMany(models.comment);
  };
  earthquake.prototype.searchMagGreaterThan = function(search){
    return (this.mag > search) ? true : false;
  }
  return earthquake;
};