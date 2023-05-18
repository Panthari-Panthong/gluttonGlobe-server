const { Schema, model } = require("mongoose");

const placeSchema = new Schema(
  {
    name: {
      type: String,
    },
    address: {
      type: String,
    },
    map: {
      type: String,
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
