import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    products: [
      {
        code: {
          type: String,
          required: true,
          uppercase: true,
          trim: true,
          match: /^[A-Z]{2}-[A-Z]{2,3}-\d{3}$/,
        },
        name: {
          type: String,
          required: true,
          trim: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],

    documentType: {
      type: String,
      enum: ["CC", "CO"],
      required: true,
    },

    paid: {
      type: Number,
      required: true,
      min: 0,
    },

    specification: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
