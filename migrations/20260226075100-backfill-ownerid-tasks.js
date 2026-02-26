'use strict';

export default {
  async up(queryInterface, Sequelize) {

    await queryInterface.sequelize.query(`
      UPDATE "Tasks"
      SET "ownerId" = (
          SELECT "ownerId"
          FROM "Projects"
          WHERE "Projects"."id" = "Tasks"."projectId"
      )
      WHERE "ownerId" IS NULL;
    `);

  },

  async down(queryInterface, Sequelize) {}
};