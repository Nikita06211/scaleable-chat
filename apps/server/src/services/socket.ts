import { Server } from "socket.io";
import { Server as HTTPServer } from "http";

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
  }

  public initListeners() {
    const io = this.io;
    console.log("initListeners");

    io.on("connect", (socket) => {
      console.log("new socket connected", socket.id);

      socket.on("event:message", async ({ message }: { message: string }) => {
        console.log("new message received", message);
      });
    });
  }

  get io() {
    return this._io;
  }
}

export default SocketService;
