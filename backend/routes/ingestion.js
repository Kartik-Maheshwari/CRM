const express = require("express");
const router = express.Router();
const Customer = require("../models/customer");
const Order = require("../models/order");
const publishToQueue = require("../publisher");

router.post("/customers", async (req, res) => {
  const { customers } = req.body;

  try {
    // Iterate over each customer object in the array
    for (const customerData of customers) {
      // Create a new Customer instance with the data
      const customer = new Customer(customerData);
      // Validate the customer object
      await customer.validate();
      // Save the validated customer object to the database
      await customer.save();
    }

    // Send a success response
    res.status(200).json({ message: "Customers ingested successfully" });
  } catch (error) {
    // Handle validation or database errors
    res.status(400).json({ error: error.message });
  }
});

router.post("/orders", async (req, res) => {
  const { orders } = req.body;
  try {
    for (const order of orders) {
      await publishToQueue("orderQueue", order);
    }
    res.status(200).json({ message: "Orders ingested successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error ingesting orders" });
  }
});

module.exports = router;
