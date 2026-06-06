const mongoose = require("mongoose");

const searchHistorySchema = new mongoose.Schema(
  {
    query:     { type: String, required: true, trim: true },
    lat:       { type: Number },
    lon:       { type: Number },
    city:      { type: String },
    country:   { type: String },
    ipAddress: { type: String },
  },
  { timestamps: true }
);

searchHistorySchema.index({ createdAt: -1 });

module.exports = mongoose.model("SearchHistory", searchHistorySchema);
