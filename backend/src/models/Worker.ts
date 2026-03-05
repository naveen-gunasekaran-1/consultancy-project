import mongoose, { Schema, Document } from 'mongoose';

export interface IWorker extends Document {
  name: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  commissionRate: number;
  totalEarnings: number;
  performanceScore: number;
  joinDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WorkerSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ['sales', 'manager', 'admin', 'support'],
    },
    commissionRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    totalEarnings: {
      type: Number,
      default: 0,
      min: 0,
    },
    performanceScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    joinDate: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IWorker>('Worker', WorkerSchema);
