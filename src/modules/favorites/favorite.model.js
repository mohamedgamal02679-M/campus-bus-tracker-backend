const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"]
    },
    stop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stop",
      required: [true, "Stop is required"]
    },
    route: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Route",
      required: [true, "Route is required"]
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [300, "Notes must not exceed 300 characters"],
      default: ""
    }
  },
  {
    timestamps: true
  }
);

favoriteSchema.index({ user: 1, stop: 1 }, { unique: true });
favoriteSchema.index({ user: 1, createdAt: -1 });
favoriteSchema.index({ route: 1 });

const Favorite = mongoose.model("Favorite", favoriteSchema);

module.exports = Favorite;