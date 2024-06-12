const mongoose = require("mongoose");

const RuleSchema = new mongoose.Schema({
  field: {
    type: String,
    required: true,
  },
  operator: {
    type: String,
    required: true,
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  logicOperator: {
    type: String,
    enum: ["AND", "OR"],
    default: "AND", // Default value can be 'AND' or 'OR'
  },
});

const CampaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  rules: {
    type: [RuleSchema],
    required: true,
  },
  audienceSize: {
    type: Number,
    required: true,
  },
  sent: {
    type: Number,
    default: 0,
  },
  failed: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  userId: {
    // Add this field
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("Campaign", CampaignSchema);
