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

export async function produceMessage(message: string) {
    const producer = await createProducer();
    await producer.send({
        messages: [{key: `message-${Date.now()}`, value: message}],
        topic: 'MESSAGES'
    })
    return true;
}

export async function startMessageConsumer(){
    const cosumer = kafka.consumer({groupId: 'default'});
    await cosumer.connect();
    await cosumer.subscribe({topic: 'MESSAGES', fromBeginning: true});

    await cosumer.run({
        autoCommit: true,
        eachMessage : async({message, pause})=>{
            console.log("New message received");
            if(message.value === null) return;
            try {
                await prisma.message.create({
                    data:{
                        text: message.value?.toString(),
                    },
                });
            } catch (error) {
                console.log("something is wrong");
                pause();
                setTimeout(()=>{
                    cosumer.resume([{topic: 'MESSAGES'}]);
                }, 60*1000)
            }
        },
    });
}

export default kafka;