const mongoose = require("mongoose");

const housePointSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  category: {
    type: String,
    required: true,
    enum: ["Gryff", "Slyth", "Raven", "Huff"],
  },
  points: {
    type: Number,
    required: true,
    min: 1,
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

// Index for efficient time-based queries
housePointSchema.index({ timestamp: -1 });
housePointSchema.index({ category: 1, timestamp: -1 });

module.exports = mongoose.model("HousePoint", housePointSchema);
