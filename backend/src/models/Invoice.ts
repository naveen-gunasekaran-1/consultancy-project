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
