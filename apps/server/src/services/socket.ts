import { Server } from "socket.io";
import Valkey from 'iovalkey';
import 'dotenv/config';
import { produceMessage } from "./kafka";

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
    sub.subscribe('MESSAGES');
  }

  public initListeners() {
    const io = this.io;
    console.log("initListeners");

    io.on("connect", (socket) => {
      console.log("new socket connected", socket.id);

      socket.on("event:message", async ({ message }: { message: string }) => {
        console.log("new message received", message);
        await pub.publish('MESSAGES', JSON.stringify({message}));
      });
    });
    sub.on('message', async(channel,message)=>{
      if(channel === 'MESSAGES'){
        console.log("new message from redis", message);
        io.emit('message', message);
        await produceMessage(message);
        console.log("Message produced to kafka");
      }
    });
  }

  get io() {
    return this._io;
  }
}

export default SocketService;
