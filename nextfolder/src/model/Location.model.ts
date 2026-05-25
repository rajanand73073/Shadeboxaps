import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface GeoLocation {
  type: "Point";
  coordinates: [number, number];
}

export interface LocationDocument extends Document {
  roomName: string;
  creatorId: Types.ObjectId;
  radius: number;
  location: GeoLocation;
   expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LocationSchema = new Schema<LocationDocument>(
  {
    roomName: {
      type: String,
      required: [true, "Room name is required"],
      trim: true,
    },
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator ID is required"],
    },
    radius: {
      type: Number,
      default: 5000,
      min: [1, "Radius must be greater than 0"],
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
        required: true,
      },
      coordinates: {
        type: [Number],
        required: [true, "Coordinates are required"],
      },
    },
    expiresAt: {
      type: Date,
      required: true
   }
  },
  {
    timestamps: true,
  },
);

LocationSchema.index({ location: "2dsphere" });
LocationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const LocationModel =
  (mongoose.models.Location as Model<LocationDocument>) ||
  mongoose.model<LocationDocument>("Location", LocationSchema);

export default LocationModel;
