const express = require("express");
const router = express.Router();

module.exports = (channel) => {
  router.post("/", (req, res) => {
    const { customerId, amount, date } = req.body;
    if (!customerId || !amount || !date) {
      return res.status(400).send("Invalid data");
    }
    channel.sendToQueue("orderQueue", Buffer.from(JSON.stringify(req.body)));
    res.status(200).send("Order data received");
  });

  return router;
};
