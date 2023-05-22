const { Schema, model } = require("mongoose");

const placeSchema = new Schema(
  {
    city: {
      type: String,
    },
    lat: {
      type: Number,
    },
    lng: {
      type: Number,
    },
    country: {
      type: String,
    },
    iso2: {
      type: String,
    },
    population: {
      type: Number,
    },
    post: {
      type: [Schema.Types.ObjectId],
      ref: "Post",
    },
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const Place = model("Place", placeSchema);

module.exports = Place;
