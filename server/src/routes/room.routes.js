import bcrypt from "bcryptjs";
import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { Question, Room } from "../models/index.js";
import { generateRoomCode } from "../utils/roomCode.js";

const router = Router();

router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const rooms = await Room.findAll({
      where: { ownerId: req.user.id },
      order: [["createdAt", "DESC"]],
    });

    res.json({ rooms });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { name, password } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Nome da sala é obrigatório." });
    }

    if (!isValidRoomPassword(password)) {
      return res
        .status(400)
        .json({ message: "A senha da sala precisa ter pelo menos 5 dígitos." });
    }

    let code = generateRoomCode();
    while (await Room.findOne({ where: { code } })) {
      code = generateRoomCode();
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const room = await Room.create({
      name,
      code,
      passwordHash,
      ownerId: req.user.id,
    });

    res.status(201).json({ room });
  } catch (error) {
    next(error);
  }
});

router.get("/:code", async (req, res, next) => {
  try {
    const room = await Room.findOne({
      where: { code: req.params.code.toUpperCase() },
      include: [{ model: Question, as: "questions" }],
      order: [[{ model: Question, as: "questions" }, "createdAt", "DESC"]],
    });

    if (!room) {
      return res.status(404).json({ message: "Sala não encontrada." });
    }

    res.json({ room });
  } catch (error) {
    next(error);
  }
});

router.delete("/:code", async (req, res, next) => {
  try {
    const { roomPassword } = req.body;
    const room = await Room.findOne({
      where: {
        code: req.params.code.toUpperCase(),
        ownerId: req.user.id,
      },
    });

    if (!room) {
      return res.status(404).json({ message: "Sala não encontrada." });
    }

    const passwordMatches = await verifyRoomPassword(room, roomPassword);
    if (!passwordMatches) {
      return res.status(403).json({ message: "Senha da sala inválida." });
    }

    await Question.destroy({ where: { roomId: room.id } });
    await room.destroy();

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

function isValidRoomPassword(password) {
  return typeof password === "string" && /^\d{5,}$/.test(password);
}

async function verifyRoomPassword(room, roomPassword) {
  if (!room?.passwordHash || !roomPassword) {
    return false;
  }

  return bcrypt.compare(String(roomPassword), room.passwordHash);
}

export default router;
