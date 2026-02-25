'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'refreshToken');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'refreshToken', {
      type: Sequelize.STRING, // or TEXT, depending on your original type
      allowNull: true, // set based on your original column definition
      // Add any other attributes your original column had
    });
  }
};