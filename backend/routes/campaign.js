const express = require("express");
const router = express.Router();
const Campaign = require("../models/campaign");
const Customer = require("../models/customer");
const CommunicationLog = require("../models/CommunicationLog");
const amqp = require("amqplib/callback_api");
const { verifyToken } = require("../middleware/auth");

const buildQueryFromRules = (rules) => {
  const query = [];

  const operatorMapping = {
    ">": "$gt",
    "<": "$lt",
    ">=": "$gte",
    "<=": "$lte",
  };

  rules.forEach((rule, index) => {
    const operator = operatorMapping[rule.operator];
    if (!operator) {
      throw new Error(`Unsupported operator: ${rule.operator}`);
    }

    const condition = {};
    switch (rule.field) {
      case "totalSpends":
        condition.totalSpends = { [operator]: rule.value };
        break;
      case "visits":
        condition.visits = { [operator]: rule.value };
        break;
      case "lastVisit":
        const date = new Date();
        date.setMonth(date.getMonth() - rule.value);
        condition.lastVisit = { [operator]: date };
        break;
      default:
        break;
    }

    if (index === 0) {
      query.push(condition);
    } else {
      const previousCondition = query.pop();
      if (rule.logicOperator === "AND") {
        query.push({ $and: [previousCondition, condition] });
      } else if (rule.logicOperator === "OR") {
        query.push({ $or: [previousCondition, condition] });
      }
    }
  });

  console.log(query);
  return query.length > 1 ? { $and: query } : query[0];
};

// router.post("/create", async (req, res) => {
//   const { name, rules } = req.body;

//   try {
//     const query = buildQueryFromRules(rules);
//     console.log("DBQuery", query);
//     const customers = await Customer.find(query);
//     const audienceSize = customers.length;

//     const newCampaign = new Campaign({ name, rules, audienceSize });
//     await newCampaign.save();

//     const communicationLogs = customers.map((customer) => ({
//       campaignId: newCampaign._id,
//       customerId: customer._id,
//       status: "PENDING",
//     }));
//     await CommunicationLog.insertMany(communicationLogs);

//     amqp.connect(process.env.RABBITMQ_URI, (err, connection) => {
//       if (err) throw err;
//       connection.createChannel((err, channel) => {
//         if (err) throw err;
//         const queue = "communicationQueue";
//         channel.assertQueue(queue, { durable: true });

//         communicationLogs.forEach((log) => {
//           const message = {
//             logId: log._id,
//             customerName: log.customerId.name,
//             customerId: log.customerId._id,
//           };
//           channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
//             persistent: true,
//           });
//         });

//         setTimeout(() => {
//           connection.close();
//         }, 500);
//       });
//     });

//     res.status(201).json({ campaign: newCampaign, customers });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });

// router.post("/create", verifyToken, async (req, res) => {
//   const { name, rules } = req.body;

//   // Ensure every rule has a logicOperator
//   rules.forEach((rule) => {
//     if (!rule.logicOperator) {
//       rule.logicOperator = "AND"; // Default to 'AND' if not provided
//     }
//   });

//   try {
//     const query = buildQueryFromRules(rules);
//     console.log("DBQuery", query);
//     const customers = await Customer.find(query);
//     const audienceSize = customers.length;

//     const newCampaign = new Campaign({ name, rules, audienceSize });
//     await newCampaign.save();

//     const communicationLogs = customers.map((customer) => ({
//       campaignId: newCampaign._id,
//       customerId: customer._id,
//       status: "PENDING",
//     }));
//     await CommunicationLog.insertMany(communicationLogs);

//     amqp.connect(process.env.RABBITMQ_URI, (err, connection) => {
//       if (err) throw err;
//       connection.createChannel((err, channel) => {
//         if (err) throw err;
//         const queue = "communicationQueue";
//         channel.assertQueue(queue, { durable: true });

//         communicationLogs.forEach((log) => {
//           const message = {
//             logId: log._id,
//             customerName: log.customerId.name,
//             customerId: log.customerId._id,
//           };
//           channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
//             persistent: true,
//           });
//         });

//         setTimeout(() => {
//           connection.close();
//         }, 500);
//       });
//     });

//     res.status(201).json({ campaign: newCampaign, customers });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });

// router.get("/", verifyToken, async (req, res) => {
//   try {
//     const campaigns = await Campaign.find().sort({ createdAt: -1 });
//     res.status(200).json(campaigns);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });

// router.get("/:campaignId/customers", verifyToken, async (req, res) => {
//   const { campaignId } = req.params;

//   try {
//     const campaign = await Campaign.findById(campaignId);
//     if (!campaign) {
//       return res.status(404).json({ error: "Campaign not found" });
//     }

//     const query = buildQueryFromRules(campaign.rules);
//     const customers = await Customer.find(query);

//     res.status(200).json(customers);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });

router.post("/create", verifyToken, async (req, res) => {
  const { name, rules } = req.body;

  rules.forEach((rule) => {
    if (!rule.logicOperator) {
      rule.logicOperator = "AND"; // Default to 'AND' if not provided
    }
  });

  try {
    const query = buildQueryFromRules(rules);
    const customers = await Customer.find(query);
    const audienceSize = customers.length;

    const newCampaign = new Campaign({
      name,
      rules,
      audienceSize,
      userId: req.user.id, // Associate with the user
    });
    await newCampaign.save();

    const communicationLogs = customers.map((customer) => ({
      campaignId: newCampaign._id,
      customerId: customer._id,
      status: "PENDING",
    }));
    await CommunicationLog.insertMany(communicationLogs);

    amqp.connect(process.env.RABBITMQ_URI, (err, connection) => {
      if (err) throw err;
      connection.createChannel((err, channel) => {
        if (err) throw err;
        const queue = "communicationQueue";
        channel.assertQueue(queue, { durable: true });

        communicationLogs.forEach((log) => {
          const message = {
            logId: log._id,
            customerName: log.customerId.name,
            customerId: log.customerId._id,
          };
          channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
            persistent: true,
          });
        });

        setTimeout(() => {
          connection.close();
        }, 500);
      });
    });

    res.status(201).json({ campaign: newCampaign, customers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/", verifyToken, async (req, res) => {
  try {
    const campaigns = await Campaign.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    res.status(200).json(campaigns);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/:campaignId/customers", verifyToken, async (req, res) => {
  const { campaignId } = req.params;

  try {
    const campaign = await Campaign.findOne({
      _id: campaignId,
      userId: req.user.id,
    });
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    const query = buildQueryFromRules(campaign.rules);
    const customers = await Customer.find(query);

    res.status(200).json(customers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/delivery-receipt", async (req, res) => {
  const { logId, status } = req.body;

  try {
    await CommunicationLog.findByIdAndUpdate(logId, { status });
    res.status(200).json({ message: "Status updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/audience-size", async (req, res) => {
  const { rules } = req.body;

  try {
    const query = buildQueryFromRules(rules);
    const customers = await Customer.find(query);
    const audienceSize = customers.length;

    res.status(200).json({ audienceSize });
  } catch (error) {
    console.error("Error fetching audience size:", error);
    res.status(500).json({ error: "Error fetching audience size" });
  }
});

module.exports = router;
