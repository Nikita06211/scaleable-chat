// apps/server/src/routes/auth.ts
import express from "express";
import prisma from "../prisma";

const router = express.Router();

router.post("/auth", async (req, res) => {
  const { username } = req.body;

  if (!username || typeof username !== "string") {
    return res.status(400).json({ error: "Invalid username" });
  }

  let user = await prisma.user.findUnique({ where: { username } });

  if (!user) {
    user = await prisma.user.create({
      data: { username },
    });
  }

  res.json({ user });
});

export default router;
