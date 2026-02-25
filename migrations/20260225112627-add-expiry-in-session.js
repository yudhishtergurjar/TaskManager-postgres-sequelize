export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Sessions', 'expiresAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal(
        "CURRENT_TIMESTAMP + INTERVAL '7 days'"
      )
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Sessions', 'expiresAt');
  }
};