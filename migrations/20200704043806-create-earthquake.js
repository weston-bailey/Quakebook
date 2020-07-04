'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('earthquakes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      usgsId: {
        type: Sequelize.STRING
      },
      mag: {
        type: Sequelize.FLOAT
      },
      place: {
        type: Sequelize.STRING
      },
      time: {
        type: Sequelize.FLOAT
      },
      url: {
        type: Sequelize.STRING
      },
      felt: {
        type: Sequelize.INTEGER
      },
      alert: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
      },
      tsunami: {
        type: Sequelize.INTEGER
      },
      sig: {
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING
      },
      latitude: {
        type: Sequelize.FLOAT
      },
      longitude: {
        type: Sequelize.FLOAT
      },
      depth: {
        type: Sequelize.FLOAT
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('earthquakes');
  }
};