const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: true
    },
    desc: { 
      type: String, 
      required: true 
    },
    img: { 
      type: String,
      default: "my_image.png"
    },
    categories: { 
      type: Array 
    },
    size: { 
      type: String,
      default: 0
    },
    color: { 
      type: String 
    },
    price: { 
      type: Number, 
      required: true 
    },
    seller: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    }
  }
);

module.exports = mongoose.model("Product", ProductSchema);