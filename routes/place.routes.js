const router = require("express").Router();
const { isAuthenticated } = require("../middleware/jwt.middleware");
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
router.get("/mymap/:userId", async (req, res) => {
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

router.patch("/mymap/addtoBeen/:userId", async (req, res) => {
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

router.patch("/mymap/addtoVisit/:userId", async (req, res) => {
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

//  Route to get one place's details
router.get("/places/:id", (req, res, next) => {
  Place.findById(req.params.id)
    .populate("post")
    .then((place) => res.status(200).json(place))
    .catch((error) => res.json(error));
});

// Route to create a post on a place's detail page
router.post("/places/:id", isAuthenticated, (req, res, next) => {
  const { comment } = req.body;

  Post.create({ user: payload, comment, place: req.params.id })
    .then((newPost) => {
      Place.findByIdAndUpdate(req.params.id, {
        $push: { post: newPost._id },
      });
    })
    .then((response) => res.status(200).json(response))
    .catch((err) => res.json(err));
});

module.exports = router;
