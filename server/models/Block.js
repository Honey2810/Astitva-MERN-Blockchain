import mongoose from 'mongoose';

const blockSchema = new mongoose.Schema(
  {
    index: {
      type: Number,
      required: true,
      unique: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
    previousHash: {
      type: String,
      required: true,
    },
    hash: {
      type: String,
      required: true,
    },
    nonce: {
      type: Number,
      required: true,
      default: 0,
    },
    certificateHash: {
      type: String,
      required: true,
    },
    certificateType: {
      type: String,
      required: true,
      enum: ['birth', 'death', 'genesis'],
    },
  },
  {
    timestamps: false, // We control the block timestamp manually
  }
);

const Block = mongoose.model('Block', blockSchema);

export default Block;
