'use strict';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'Tasks',
      'ownerId',
      {
        type: Sequelize.INTEGER,
        allowNull: true,
        references:{
            model:'Users',
            key:'id'
        },
        onDelete:'CASCADE'
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Tasks', 'ownerId');
  }
};