const mongoose = require("mongoose");
const { ANNOUNCEMENT_PRIORITIES } = require("../../utils/constants");

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Announcement title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [150, "Title must not exceed 150 characters"]
    },
    message: {
      type: String,
      required: [true, "Announcement message is required"],
      trim: true,
      minlength: [5, "Message must be at least 5 characters"],
      maxlength: [1000, "Message must not exceed 1000 characters"]
    },
    priority: {
      type: String,
      enum: ANNOUNCEMENT_PRIORITIES,
      default: "medium"
    },
    scope: {
      type: String,
      enum: ["general", "route", "stop"],
      default: "general"
    },
    relatedRoute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Route",
      default: null
    },
    relatedStop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stop",
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    },
    startsAt: {
      type: Date,
      default: Date.now
    },
    endsAt: {
      type: Date,
      default: null
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Created by admin is required"]
    }
  },
  {
    timestamps: true
  }
);

announcementSchema.pre("validate", function () {
  if (this.scope === "route" && !this.relatedRoute) {
    throw new Error("relatedRoute is required when scope is route");
  }

  if (this.scope === "stop" && !this.relatedStop) {
    throw new Error("relatedStop is required when scope is stop");
  }

  if (this.scope === "general") {
    this.relatedRoute = null;
    this.relatedStop = null;
  }

  if (this.endsAt && this.startsAt && this.endsAt <= this.startsAt) {
    throw new Error("endsAt must be later than startsAt");
  }
});

announcementSchema.index({ isActive: 1, createdAt: -1 });
announcementSchema.index({ scope: 1, relatedRoute: 1, relatedStop: 1 });

const Announcement = mongoose.model("Announcement", announcementSchema);

module.exports = Announcement;