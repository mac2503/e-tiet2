const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
  {
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
    createdAt: {
      type: Date,
      default: Date.now
    },
    buyer: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    seller: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['order_placed', 'completed'],
      default: 'order_placed'
    },
    buyerPhone: {
      type: String
    },
    buyerAddress: {
      type: String
    },
    paymentType: {
      type: String,
      enum: ['net_banking', 'COD'],
      default: 'COD'
    },
    totalAmount: {
      type: Number,
      required: true
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// OrderSchema.index({ buyer: 1, seller: 1 });

module.exports = mongoose.model('Order', OrderSchema);