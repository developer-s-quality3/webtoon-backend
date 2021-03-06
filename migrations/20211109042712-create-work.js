'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Works', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM,
        values: ['regular', 'application', 'declined', 'pending'],
        defaultValue: 'pending',
      },
      title: {
        type: Sequelize.CHAR,
      },
      workThumbnail: {
        type: Sequelize.STRING,
      },
      workDescription: {
        type: Sequelize.CHAR,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Works');
  },
};
