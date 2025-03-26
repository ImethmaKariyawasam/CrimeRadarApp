import mongoose, { Document, Model, Schema } from "mongoose";
// Define an interface for the post document
export interface IPost extends Document {
  content: string;
  title: string;
  image?: string;
  category?: string;
  isVerified?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Define the schema using the interface
const postSchema: Schema<IPost> = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      unique: true,
    },
    image: {
      type: String,
      default:
        "https://www.hostinger.com/tutorials/wp-content/uploads/sites/2/2021/09/how-to-write-a-blog-post.png",
    },
    category: {
      type: String,
      default: "uncategorized",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Create the Post model with generics to ensure type safety
const Post: Model<IPost> = mongoose.model<IPost>("Post", postSchema);

export default Post;
