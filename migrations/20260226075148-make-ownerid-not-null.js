'use strict';

export default {
  async up(queryInterface, Sequelize) {

    await queryInterface.changeColumn('Tasks','ownerId',{
      type: Sequelize.INTEGER,
      allowNull:false
    });

  },

  async down(queryInterface, Sequelize) {

    await queryInterface.changeColumn('Tasks','ownerId',{
      type: Sequelize.INTEGER,
      allowNull:true
    });

  }
};