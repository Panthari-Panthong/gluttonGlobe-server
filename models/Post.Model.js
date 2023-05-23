const { Schema, model } = require("mongoose");

const postSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    comment: {
      type: String,
    },
    picture: {
      type: String,
    },
    place: {
      type: [Schema.Types.ObjectId],
      ref: "Place",
    },
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const Post = model("Post", postSchema);

module.exports = Post;
