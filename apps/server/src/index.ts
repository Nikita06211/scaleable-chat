import express from "express";
import http from "http";
import cors from "cors";
import SocketService from "./services/socket";
import { startMessageConsumer } from "./services/kafka";
import authRoutes from "./routes/auth"; // make sure this file exists

async function init() {
  await startMessageConsumer();

  const app = express();
  const PORT = process.env.PORT || 8000;

  // Middlewares
  app.use(cors({ origin: "*", credentials: true }));
  app.use(express.json());

  // Routes
  app.use("/api", authRoutes);

  // Create HTTP server and attach socket
  const httpServer = http.createServer(app);

  const socketService = new SocketService();
  socketService.io.attach(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  socketService.initListeners();
}

init();
