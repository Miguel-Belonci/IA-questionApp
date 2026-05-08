export function defineRoom(sequelize, DataTypes) {
  return sequelize.define(
    "Room",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      passwordHash: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "rooms",
    },
  );
}
