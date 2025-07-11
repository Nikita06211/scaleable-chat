// routes/userRoutes.ts (or .js if you're using JS)
import express from "express";
import prisma from "../prisma";
const router = express.Router();

router.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
      },
    });
    res.json(users);
  } catch (err) {
    console.error("Failed to fetch users:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
