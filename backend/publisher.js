// publisher.js
const amqp = require("amqplib");

async function publishToQueue(queueName, data) {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URI);
    const channel = await connection.createChannel();
    await channel.assertQueue(queueName, { durable: false });
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)));
    console.log(`Message sent to queue ${queueName}`);
    await channel.close();
    await connection.close();
  } catch (error) {
    console.error("Error publishing to queue", error);
  }
}

module.exports = publishToQueue;
