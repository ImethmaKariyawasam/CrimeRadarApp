import mongoose, { Document, Model, Schema } from "mongoose";
import { INotice } from "./notice.model";
 // Assuming NoticeBoard is in a separate file
require("dotenv").config();

export interface IReport extends Document {
  userId: string;
  noticeId: string;
  location: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  description: string;
  createdAt: Date;
  isVerified: boolean;
}

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
const ReportSchema: Schema<IReport> = new mongoose.Schema({
  userId: {
    type: Schema.Types.String,
    ref: "User", // Reference the User model (replace 'User' with the actual model name)
    required: true,
  },
  noticeId: {
    type: Schema.Types.String,
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
const Report: Model<IReport> = mongoose.model("Report", ReportSchema);

export default Report;
