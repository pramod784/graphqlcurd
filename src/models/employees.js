"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class employees extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.user, {
        foreignKey: "user_id",
        targetKey: "id",
      });
    }
  }
  employees.init(
    {
      user_id: DataTypes.INTEGER,
      organization_name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "employees",
      underscored: true,
    }
  );
  return employees;
};
