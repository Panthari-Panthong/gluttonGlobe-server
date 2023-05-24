const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required."],
    },
    username: {
      type: String,
      required: [true, "Username is required."],
    },
    picture: {
      type: String,
      default:
        "https://res.cloudinary.com/dkzhxg8ci/image/upload/v1684507275/User-avatar_kjsqw4.png",
    },
    about: {
      type: String,
      default: "About me...",
    },
    placesBeen: {
      type: [Schema.Types.ObjectId],
      ref: "Place",
    },
    placesVisit: {
      type: [Schema.Types.ObjectId],
      ref: "Place",
    },
    posts: {
      type: [Schema.Types.ObjectId],
      ref: "Post",
    },
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const User = model("User", userSchema);

module.exports = User;
