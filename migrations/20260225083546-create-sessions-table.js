export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('Sessions', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      primaryKey: true
    },

    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },

    refreshToken: {
      type: Sequelize.TEXT,
      allowNull: false
    },

    isActive: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    },

    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },

    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    }
  });

  await queryInterface.addIndex('Sessions', ['userId']);
}

export async function down(queryInterface) {
  await queryInterface.dropTable('Sessions');
}