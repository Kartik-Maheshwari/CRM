const express = require("express");
const router = express.Router();

module.exports = (channel) => {
  router.post("/", (req, res) => {
    const { name, email, totalSpends } = req.body;
    if (!name || !email || !totalSpends) {
      return res.status(400).send("Invalid data");
    }
    channel.sendToQueue("customerQueue", Buffer.from(JSON.stringify(req.body)));
    res.status(200).send("Customer data received");
  });

  return router;
};
