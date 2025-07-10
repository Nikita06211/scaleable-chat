import { Kafka, Producer } from "kafkajs";
import fs from 'fs';
import path from 'path';
import prisma from "../prisma";

const kafka = new Kafka({
  brokers: ['kafka-2dfe3ae5-bansalnikita06-8f8b.c.aivencloud.com:13950'],
  ssl:{
    ca: [fs.readFileSync(path.resolve("./ca.pem"), "utf-8")],
  },
  sasl: {
    mechanism: 'plain',
    username: 'avnadmin',
    password: process.env.KAFKA_PASSWORD || ""
  }
});

let producer: null| Producer = null;

export async function createProducer(){
    if (producer) {
        return producer;
    }
    const _producer = kafka.producer();
    await _producer.connect();
    producer = _producer;
    return producer;
}

export async function produceMessage(raw: string) {
  const producer = await createProducer();
  const parsed = JSON.parse(raw);

  await producer.send({
    topic: 'MESSAGES',
    messages: [
      {
        key: `message-${Date.now()}`,
        value: JSON.stringify({
          text: parsed.message,
          senderId: parsed.senderId,
          receiverId: parsed.receiverId,
        }),
      },
    ],
  });

  return true;
}


export async function startMessageConsumer(){
    const consumer = kafka.consumer({groupId: 'default'});
    await consumer.connect();
    await consumer.subscribe({topic: 'MESSAGES', fromBeginning: true});

    await consumer.run({
        autoCommit: true,
        eachMessage: async ({ message, pause }) => {
            console.log("New message received from Kafka");

            if (!message.value) return;

            try {
            const msg = JSON.parse(message.value.toString());

            const { text, senderId, receiverId } = msg;

            if (!text || !senderId || !receiverId) {
                console.warn("Invalid message structure", msg);
                return;
            }

            await prisma.message.create({
                data: {
                text,
                senderId,
                receiverId,
                },
            });
            } catch (error) {
            console.error("Error storing message in DB:", error);
            pause();
            setTimeout(() => {
                consumer.resume([{ topic: 'MESSAGES' }]);
            }, 60 * 1000);
            }
        },
    });

}

export default kafka;