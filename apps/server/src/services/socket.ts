import { Server } from "socket.io";
import Valkey from 'iovalkey';
import 'dotenv/config';
import { produceMessage } from "./kafka";

const userSocketMap = new Map<string, string>();

const pub = new Valkey({
  host: 'valkey-32e36cc0-bansalnikita06-8f8b.b.aivencloud.com',
  port: 13937,
  username: 'default',
  password: process.env.VALKEY_PASSWORD
});

const sub = new Valkey({
  host: 'valkey-32e36cc0-bansalnikita06-8f8b.b.aivencloud.com',
  port: 13937,
  username: 'default',
  password: process.env.VALKEY_PASSWORD
});

class SocketService {
  private _io: Server;

  constructor() {
    console.log("SocketService");

    this._io = new Server({
      cors: {
        allowedHeaders: ["*"],
        origin: "*",
      },
    });

    // Subscribe to Valkey PubSub channel
    sub.subscribe('MESSAGES');
  }

  public initListeners() {
    const io = this.io;
    console.log("initListeners");

    io.on("connect", (socket) => {
      console.log("new socket connected", socket.id);

      // Register user
      socket.on("event:register", ({ userId }) => {
        userSocketMap.set(userId, socket.id);
      });

      // Cleanup on disconnect
      socket.on("disconnect", () => {
        for (const [userId, sId] of userSocketMap.entries()) {
          if (sId === socket.id) {
            userSocketMap.delete(userId);
            break;
          }
        }
      });

      // Message sent from client
      socket.on("event:message", async ({ senderId, receiverId, message }) => {
        const payload = { senderId, receiverId, message };
        await pub.publish('MESSAGES', JSON.stringify(payload));
      });
    });

    // Message received from Redis and sent to both users
    sub.on("message", async (channel, rawMessage) => {
      try {
        const { senderId, receiverId, message } = JSON.parse(rawMessage);
        const payload = { senderId, receiverId, message };

        const receiverSocketId = userSocketMap.get(receiverId);
        const senderSocketId = userSocketMap.get(senderId);

        if (receiverSocketId) {
          io.to(receiverSocketId).emit("event:message", payload);
        }

        if (senderSocketId) {
          io.to(senderSocketId).emit("event:message", payload);
        }

        await produceMessage(rawMessage);
      } catch (err) {
        console.error("Failed to process Redis message:", err);
      }
    });
  }

  get io() {
    return this._io;
  }
}

export default SocketService;
