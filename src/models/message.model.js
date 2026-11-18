import mongoose from 'mongoose';
import { toJSONOptions } from './toJSON.js';

const messageSchema = new mongoose.Schema(
  {
    user: { type: String, required: true, trim: true, lowercase: true },
    message: { type: String, required: true, trim: true },
  },
  { timestamps: true, toJSON: toJSONOptions }
);

export const MessageModel = mongoose.model('Message', messageSchema);
