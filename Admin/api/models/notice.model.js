import mongoose from "mongoose";
import bcrypt from "bcryptjs";
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

const NoticeBoardSchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, "Please enter the type of notice"],
  },
  name: {
    type: String,
    required: [true, "Please enter the name of the person"],
  },
  age: {
    type: Number,
    required: [true, "Please enter the age of the person"],
  },
  image: {
    type: String,
    required: true,
  },
  height: {
    type: Number,
    required: true,
  },
  weight: {
    type: Number,
    required: true,
  },
  eye_color: {
    type: String,
    required: true,
  },
  hair_color: {
    type: String,
    required: true,
  },
  distinctive_marks: {
    type: String,
    required: true,
  },
  alias: {
    type: [String], // Array of aliases
  },
  description: {
    type: String,
  },
  missingDate: {
    type: Date,
  },
  dangerLevel: {
    type: String,
    enum: ["Low", "Medium", "High", "Critical"], // Example danger levels
  },
  location: {
    type: LocationSchema,
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  userId: {
    type: String,
    required: false,
  },
});

// Add a geospatial index to enable location-based queries
NoticeBoardSchema.index({ location: "2dsphere" });

const NoticeBoard = mongoose.model("NoticeBoard", NoticeBoardSchema);

export default NoticeBoard;
