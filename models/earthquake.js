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
  earthquake.prototype.search = function(terms){
    let result = false;
    //magnitude
    switch(terms.mag.type){
      case 'all':
        result = true;
        break;
      case 'greaterThan':
        result = (this.mag > terms.mag.value) ? true : false;
        break;
      case 'equalTo':
        result = (this.mag == terms.mag.value) ? true : false;
        break;
      case 'lessThan':
        result = (this.mag < terms.mag.value) ? true : false;
        break;
      default:
        result = true;
    }
    return result;
  }
  return earthquake;
};