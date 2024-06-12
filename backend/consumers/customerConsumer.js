// backend/consumers/orderConsumer.js
const mongoose = require("mongoose");
const amqp = require("amqplib/callback_api");
const dotenv = require("dotenv");
const Order = require("../models/order");
const Customer = require("../models/customer");

dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Function to process the order data
async function processOrder(orderData) {
  try {
    const order = new Order(orderData);
    const savedOrder = await order.save();

    // Update customer totalSpends and visits
    const customer = await Customer.findById(savedOrder.customerId);
    if (customer) {
      customer.totalSpends += savedOrder.amount;
      customer.visits += 1;
      customer.lastVisit = savedOrder.date;
      await customer.save();
    }
  } catch (err) {
    console.error("Error processing order:", err);
  }
}

// Connect to RabbitMQ
amqp.connect(process.env.RABBITMQ_URI, (err, conn) => {
  if (err) {
    console.error("Error connecting to RabbitMQ:", err);
    return;
  }
  conn.createChannel((err, ch) => {
    if (err) {
      console.error("Error creating RabbitMQ channel:", err);
      return;
    }
    ch.assertQueue("orderQueue", { durable: false });
    console.log("Waiting for messages in orderQueue. To exit press CTRL+C");
    ch.consume(
      "orderQueue",
      (msg) => {
        if (msg !== null) {
          const orderData = JSON.parse(msg.content.toString());
          processOrder(orderData);
          ch.ack(msg);
        }
      },
      { noAck: false }
    );
  });
});
