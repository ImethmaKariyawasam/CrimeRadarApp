import mongoose, { Schema, Document } from 'mongoose';

interface IAdvertisement extends Document {
  title: string;
  description: string;
  category: string;
  targetAudience: string;
  startDate: Date;
  endDate: Date;
  pricingInformation: string;
  agreeTerms: boolean;
  imageUrl: string;
  pdfUrl: string;
  uniqueCode: string;
  email: string;
}

const AdvertisementSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  targetAudience: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  pricingInformation: { type: String, required: true },
  agreeTerms: { type: Boolean, required: true },
  imageUrl: { type: String },
  pdfUrl: { type: String },
  uniqueCode: { type: String, required: true },
  email: { type: String, required: true }
});

export default mongoose.model<IAdvertisement>('Advertisement', AdvertisementSchema);