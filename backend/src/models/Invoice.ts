import mongoose, { Schema, Document } from 'mongoose';

interface IInvoiceItem {
  guideId: mongoose.Types.ObjectId;
  guideName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface IInvoice extends Document {
  invoiceNo: string;
  clientId: mongoose.Types.ObjectId;
  items: IInvoiceItem[];
  totalAmount: number;
  discount?: number;
  notes?: string;
  status: 'paid' | 'unpaid' | 'partial';
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema: Schema = new Schema(
  {
    invoiceNo: {
      type: String,
      required: true,
      unique: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },
    items: [
      {
        guideId: {
          type: Schema.Types.ObjectId,
          ref: 'Guide',
          required: true,
        },
        guideName: String,
        quantity: Number,
        price: Number,
        subtotal: Number,
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
    },
    status: {
      type: String,
      enum: ['paid', 'unpaid', 'partial'],
      default: 'unpaid',
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IInvoice>('Invoice', InvoiceSchema);
