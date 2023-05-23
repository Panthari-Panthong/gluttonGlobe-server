const router = require("express").Router();
// Implment isAuthenticated when the test is done
//const { isAuthenticated } = require("../middleware/jwt.middleware");
const User = require("../models/User.model");
const Place = require("../models/Place.Model");
const mongoose = require("mongoose");
const Post = require("../models/Post.Model");

router.get("/places", async (req, res, next) => {
  try {
    const response = await Place.find().populate("post");
    res.send({ data: response });
  } catch (error) {
    console.log(error);
  }
});

// Route to fetch places saved by the user
router.get("/places/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const ObjectId = mongoose.Types.ObjectId;
    const placesFromUser = await User.aggregate([
      { $match: { _id: new ObjectId(userId) } },
      {
        $lookup: {
          from: "places",
          as: "placesBeenFromUser",
          localField: "placesBeen",
          foreignField: "_id",
        },
      },
      {
        $lookup: {
          from: "places",
          as: "placesVisitFromUser",
          localField: "placesVisit",
          foreignField: "_id",
        },
      },
      {
        $project: {
          _id: 0,
          placesBeenFromUser: "$placesBeenFromUser",
          placesVisitFromUser: "$placesVisitFromUser",
        },
      },
    ]);
    res.status(200).json({ placesFromUser });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Error fetching places saved by the users" });
  }
});

router.patch("/places/addtoBeen/:userId", async (req, res) => {
  const userId = req.params.userId;
  const { placesBeen } = req.body; // Id of the place
  try {
    const updatedUserInfo = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { placesBeen: placesBeen._id } },
      { new: true }
    );
    res.status(200).json({ updatedUserInfo });
  } catch (error) {
    console.log(error);
  }
});

router.patch("/places/addtoVisit/:userId", async (req, res) => {
  const userId = req.params.userId;
  const { placesVisit } = req.body; // Id of the place
  try {
    const updatedUserInfo = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { placesVisit: placesVisit._id } },
      { new: true }
    );
    res.status(200).json({ updatedUserInfo });
  } catch (error) {
    console.log(error);
  }
});

router.get("/places/:id", (req, res, next) => {
  Place.findById(req.params.id)
    .populate("post")
    .then((place) => res.status(200).json(place))
    .catch((error) => res.json(error));
});

router.post("/places/:id", (req, res, next) => {
  const { comment } = req.body;

  Post.create({ comment, place: req.params.id }) // + user to add if logged in
    .then((newPost) => {
      return Place.findByIdAndUpdate(req.params.id, {
        $push: { post: newPost._id },
      });
    })
    .then((response) => res.json(response))
    .catch((err) => res.json(err));
});

module.exports = router;
