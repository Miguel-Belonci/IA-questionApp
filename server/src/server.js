import app from "./app.js";
import { sequelize } from "./models/index.js";

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || "0.0.0.0";

async function start() {
  try {
    await sequelize.authenticate();
    await prepareSqliteSchema();
    await sequelize.sync();
    app.listen(PORT, HOST, () => {
      console.log(`API rodando em http://${HOST}:${PORT}`);
    });
  } catch (error) {
    console.error("Erro ao iniciar servidor:", error);
    process.exit(1);
  }
}

async function prepareSqliteSchema() {
  if (sequelize.getDialect() !== "sqlite") {
    return;
  }

  await sequelize.query("DROP TABLE IF EXISTS `users_backup`;");
  await sequelize.query("DROP TABLE IF EXISTS `rooms_backup`;");
  await sequelize.query("DROP TABLE IF EXISTS `questions_backup`;");

  const [roomsColumns] = await sequelize.query("PRAGMA table_info(`rooms`);");
  const hasRoomPasswordHash = roomsColumns.some(
    (column) => column.name === "passwordHash",
  );

  if (!hasRoomPasswordHash) {
    await sequelize.query(
      "ALTER TABLE `rooms` ADD COLUMN `passwordHash` VARCHAR(255);",
    );
  }
}

start();
