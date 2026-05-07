import bcrypt from "bcryptjs";
import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { User } from "../models/index.js";
import { signToken } from "../utils/token.js";

const router = Router();

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Nome, email e senha são obrigatorios." });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "A senha precisa ter pelo menos 6 caracteres." });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Este email já está cadastrado." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const usersCount = await User.count();
    const user = await User.create({
      name,
      email,
      passwordHash,
      role: usersCount === 0 ? "admin" : "user",
    });

    res.status(201).json({
      token: signToken(user),
      user: serializeUser(user),
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email e senha sao obrigatorios." });
    }

    const user = await User.findOne({ where: { email } });
    const passwordMatches = user
      ? await bcrypt.compare(password, user.passwordHash)
      : false;

    if (!user || !passwordMatches) {
      return res.status(401).json({ message: "Credenciais invalidas." });
    }

    if (!user.active) {
      return res.status(403).json({ message: "Sua conta esta inativa." });
    }

    res.json({
      token: signToken(user),
      user: serializeUser(user),
    });
  } catch (error) {
    next(error);
  }
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: serializeUser(req.user) });
});

router.patch("/password", requireAuth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Senha atual e nova senha sao obrigatorias." });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "A nova senha precisa ter pelo menos 6 caracteres." });
    }

    const passwordMatches = await bcrypt.compare(
      currentPassword,
      req.user.passwordHash,
    );
    if (!passwordMatches) {
      return res.status(403).json({ message: "Senha atual invalida." });
    }

    req.user.passwordHash = await bcrypt.hash(newPassword, 10);
    await req.user.save();

    res.json({ message: "Senha atualizada com sucesso." });
  } catch (error) {
    next(error);
  }
});

function serializeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    active: user.active,
  };
}

export default router;
