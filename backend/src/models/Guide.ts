import mongoose, { Schema, Document } from 'mongoose';

export interface IGuide extends Document {
  name: string;
  class: string;
  subject: string;
  price: number;
  quantity: number;
  publisher: string;
  createdAt: Date;
  updatedAt: Date;
}

const GuideSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    class: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    publisher: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IGuide>('Guide', GuideSchema);
