import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";
require("dotenv").config();

export interface INotice extends Document {
  type: string;
  name: string;
  age: number;
  image: string;
  thumbnail: string;
  height: number;
  weight: number;
  eye_color: string;
  hair_color: string;
  distinctive_marks: string;
  alias?: string[];
  description?: string;
  missingDate?: Date;
  dangerLevel?: string;
  location: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  isVerified: Boolean;
  userId:string;
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

const NoticeBoardSchema: Schema<INotice> = new mongoose.Schema({
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

const NoticeBoard: Model<INotice> = mongoose.model(
  "NoticeBoard",
  NoticeBoardSchema
);

export default NoticeBoard;
