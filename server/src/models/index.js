import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import { defineQuestion } from './question.model.js';
import { defineRoom } from './room.model.js';
import { defineUser } from './user.model.js';

const User = defineUser(sequelize, DataTypes);
const Room = defineRoom(sequelize, DataTypes);
const Question = defineQuestion(sequelize, DataTypes);

User.hasMany(Room, { foreignKey: 'ownerId', as: 'rooms' });
Room.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

Room.hasMany(Question, { foreignKey: 'roomId', as: 'questions' });
Question.belongsTo(Room, { foreignKey: 'roomId', as: 'room' });

User.hasMany(Question, { foreignKey: 'authorId', as: 'questions' });
Question.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

export { Question, Room, sequelize, User };
