import { Router } from 'express';
import { requireAdmin, requireAuth } from '../middlewares/auth.js';
import { Question, Room, User } from '../models/index.js';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/users', async (_req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'active', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });

    res.json({ users });
  } catch (error) {
    next(error);
  }
});

router.patch('/users/:id/status', async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    if (user.role === 'admin' && req.body.active === false) {
      return res.status(400).json({ message: 'Administradores não podem ser inativados.' });
    }

    user.active = user.role === 'admin' ? true : Boolean(req.body.active);
    await user.save();

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        active: user.active,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/rooms', async (req, res, next) => {
  try {
    const where = req.query.userId ? { ownerId: req.query.userId } : undefined;
    const rooms = await Room.findAll({
      where,
      attributes: ['id', 'name', 'code', 'ownerId', 'createdAt', 'updatedAt'],
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email', 'active'],
        },
        {
          model: Question,
          as: 'questions',
          attributes: ['id', 'read', 'createdAt'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({
      rooms: rooms.map((room) => ({
        id: room.id,
        name: room.name,
        code: room.code,
        ownerId: room.ownerId,
        owner: room.owner,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt,
        questionsCount: room.questions?.length || 0,
        openQuestionsCount: room.questions?.filter((question) => !question.read).length || 0,
        readQuestionsCount: room.questions?.filter((question) => question.read).length || 0,
      })),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
