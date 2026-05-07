import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();

const dialect = process.env.DB_DIALECT || 'sqlite';

const config =
  process.env.DATABASE_URL
    ? {
        url: process.env.DATABASE_URL,
        dialect: 'postgres',
      }
    : dialect === 'postgres'
    ? {
        dialect,
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT || 5432),
        database: process.env.DB_NAME,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      }
    : {
        dialect: 'sqlite',
        storage: process.env.SQLITE_STORAGE || './database.sqlite',
      };

export const sequelize = config.url
  ? new Sequelize(config.url, {
      dialect: config.dialect,
      logging: process.env.DB_LOGGING === 'true' ? console.log : false,
    })
  : new Sequelize({
      ...config,
      logging: process.env.DB_LOGGING === 'true' ? console.log : false,
    });
