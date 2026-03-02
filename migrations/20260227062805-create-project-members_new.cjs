'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ProjectMembers', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },

      projectId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Projects',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },

      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },

      role: {
        type: Sequelize.ENUM('owner', 'member'),
        defaultValue: 'member'
      },

      status: {
        type: Sequelize.ENUM('active', 'blocked'),
        defaultValue: 'active'
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

    await queryInterface.addConstraint('ProjectMembers', {
      fields: ['projectId', 'userId'],
      type: 'unique',
      name: 'Unique_Project_User'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ProjectMembers');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_ProjectMembers_role";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_ProjectMembers_status";');
  }
};