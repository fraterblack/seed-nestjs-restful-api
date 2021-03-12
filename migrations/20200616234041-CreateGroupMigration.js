'use strict';

const { Op } = require("sequelize");

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('groups', {
      id: {
        type: Sequelize.DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.literal('uuid_generate_v4()')
      },

      name: {
        type: Sequelize.DataTypes.STRING(30),
        allowNull: false,
      },

      active: {
        type: Sequelize.DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: true
      },

      // Timestamps ------------------------------------------
      createdAt: {
        type: Sequelize.DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },

      updatedAt: {
        type: Sequelize.DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },

      deletedAt: {
        type: Sequelize.DataTypes.DATE
      },
    })
      .then(() => queryInterface.addIndex('groups', ['name'], {
        unique: true,
        name: 'groups__name_unique_constraint',
        where: { deletedAt: { [Op.eq]: null } }
      }));
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeIndex('groups', ['name'])
      .then(() => queryInterface.dropTable('groups'));
  }
};
