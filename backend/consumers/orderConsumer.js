const dotenv = require("dotenv");
dotenv.config();
const amqp = require("amqplib");
const mongoose = require("mongoose");
const Order = require("../models/order");

async function consumeFromQueue(queueName) {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    const connection = await amqp.connect(process.env.RABBITMQ_URI);
    const channel = await connection.createChannel();
    await channel.assertQueue(queueName, { durable: false });

    channel.consume(
      queueName,
      async (msg) => {
        if (msg !== null) {
          const orderData = JSON.parse(msg.content.toString());
          console.log("Received message:", orderData);
          try {
            const order = new Order(orderData);
            await order.save();
            console.log("Order saved:", order);
            channel.ack(msg); // Acknowledge the message as processed
          } catch (error) {
            console.error("Error saving order:", error);
            channel.nack(msg); // Nack the message to requeue
          }
        }
      },
      { noAck: false }
    );
  } catch (error) {
    console.error("Error consuming from queue", error);
  }
}

// Start consuming from the queue
consumeFromQueue("orderQueue");
