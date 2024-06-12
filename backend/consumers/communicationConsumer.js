// consumers/communicationConsumer.js
const mongoose = require("mongoose");
const amqp = require("amqplib/callback_api");
const CommunicationLog = require("../models/CommunicationLog");
const axios = require("axios");

require("dotenv").config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

amqp.connect(process.env.RABBITMQ_URI, (err, connection) => {
  if (err) throw err;
  connection.createChannel((err, channel) => {
    if (err) throw err;
    const queue = "communicationQueue";
    channel.assertQueue(queue, { durable: true });

    channel.consume(queue, async (msg) => {
      const { logId, customerName, customerId } = JSON.parse(
        msg.content.toString()
      );

      // Simulate sending a message
      const isSuccess = Math.random() < 0.9; // 90% success rate
      const status = isSuccess ? "SENT" : "FAILED";

      try {
        await CommunicationLog.findByIdAndUpdate(logId, { status });

        // Simulate hitting a delivery receipt API
        const deliveryReceipt = {
          logId,
          status,
        };

        // Update the status of the communication log entry
        await axios.post(
          `${process.env.API_URL}/api/campaign/delivery-receipt`,
          deliveryReceipt
        );

        channel.ack(msg);
      } catch (err) {
        console.error("Error updating communication log:", err);
      }
    });
  });
});
