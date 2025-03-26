import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const LocationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Point"],
    required: true,
  },
  coordinates: {
    type: [Number],
    required: true,
  },
});

// Report Schema
const ReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.String,
    ref: "User", // Reference the User model (replace 'User' with the actual model name)
    required: true,
  },
  noticeId: {
    type: mongoose.Schema.Types.String,
    ref: "NoticeBoard", // Reference the NoticeBoard model
    required: true,
  },
  location: {
    type: LocationSchema,
    required: true,
  },
  description: {
    type: String,
    required: [true, "Please provide a description for the report"],
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Add a geospatial index to enable location-based queries
ReportSchema.index({ location: "2dsphere" });

// Report model
const Report = mongoose.model("Report", ReportSchema);

export default Report;
