import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { Question, Room } from '../models/index.js';

const router = Router();

router.use(requireAuth);

router.post('/', async (req, res, next) => {
  try {
    const { roomCode, text } = req.body;

    if (!roomCode || !text) {
      return res.status(400).json({ message: 'Codigo da sala e pergunta sao obrigatorios.' });
    }

    const room = await Room.findOne({ where: { code: roomCode.toUpperCase() } });
    if (!room) {
      return res.status(404).json({ message: 'Sala nao encontrada.' });
    }

    const question = await Question.create({
      text,
      roomId: room.id,
      authorId: req.user.id,
    });

    res.status(201).json({ question });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/read', async (req, res, next) => {
  try {
    const { roomPassword } = req.body;
    const question = await findOwnedQuestion(req.params.id, req.user.id);
    if (!question) {
      return res.status(404).json({ message: 'Pergunta nao encontrada.' });
    }

    const passwordMatches = await verifyRoomPassword(question.room, roomPassword);
    if (!passwordMatches) {
      return res.status(403).json({ message: 'Senha da sala invalida.' });
    }

    question.read = true;
    await question.save();

    res.json({ question });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { roomPassword } = req.body;
    const question = await findOwnedQuestion(req.params.id, req.user.id);
    if (!question) {
      return res.status(404).json({ message: 'Pergunta nao encontrada.' });
    }

    const passwordMatches = await verifyRoomPassword(question.room, roomPassword);
    if (!passwordMatches) {
      return res.status(403).json({ message: 'Senha da sala invalida.' });
    }

    await question.destroy();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

async function findOwnedQuestion(id, ownerId) {
  return Question.findOne({
    where: { id },
    include: [
      {
        model: Room,
        as: 'room',
        where: { ownerId },
      },
    ],
  });
}

async function verifyRoomPassword(room, roomPassword) {
  if (!room?.passwordHash || !roomPassword) {
    return false;
  }

  return bcrypt.compare(String(roomPassword), room.passwordHash);
}

export default router;
