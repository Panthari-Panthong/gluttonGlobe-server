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

/* --- GET: Route to fetch places saved by the user --- */
router.get("/mymap/:userId", isAuthenticated, async (req, res) => {
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

/* --- PATCH: Route to add placesBeen to the user --- */
router.patch("/mymap/addtoBeen/:userId", isAuthenticated, async (req, res) => {
  const userId = req.params.userId;
  const { placesBeen } = req.body; // Id of the place
  try {
    // Find the user
    const user = await User.findById(userId);
    // Check if the place has already saved by the user
    if (user.placesBeen.includes(placesBeen._id)) {
      return res.status().json({
        messgae: `${placesBeen} is already added to Places Have Been`,
      });
    } else {
      const updatedUserInfo = await User.findByIdAndUpdate(
        userId,
        { $addToSet: { placesBeen: placesBeen._id } },
        {
          new: true, // Returns the updated document
          runValidators: true, // Runs Mongoose validators on the update
        }
      );
      res.status(200).json({ updatedUserInfo });
    }
  } catch (error) {
    console.log(error);
  }
});

/* --- PUT: Route to update placesBeen of the user --- */
router.put("/mymap/updateBeen/:userId", isAuthenticated, async (req, res) => {
  const userId = req.params.userId;
  const { newPlacesBeen } = req.body; // Id of the place

  try {
    // Find the user
    const user = await User.findById(userId);

    // Checks on the place is already existed, if so, update the user's information
    if (user.placesBeen.includes(newPlacesBeen._id)) {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $pull: { placesBeen: newPlacesBeen._id } },
        {
          new: true, // Returns the updated document
          runValidators: true, // Runs Mongoose validators on the update
        }
      );
      res.status(200).json({ updatedUser });
    }
  } catch (error) {
    console.log(error);
  }
});

/* --- PATCH: Route to add placesVisit to the user --- */
router.patch("/mymap/addtoVisit/:userId", isAuthenticated, async (req, res) => {
  const userId = req.params.userId;
  const { placesVisit } = req.body; // Id of the place
  try {
    // Find the user
    const user = await User.findById(userId);

    // Check if the place has already saved by the user
    if (user.placesVisit.includes(placesVisit._id)) {
      return res.status().json({
        messgae: `${placesVisit} is already added to Places Want To Visit`,
      });
    } else {
      const updatedUserInfo = await User.findByIdAndUpdate(
        userId,
        { $addToSet: { placesVisit: placesVisit._id } },
        {
          new: true, // Returns the updated document
          runValidators: true, // Runs Mongoose validators on the update
        }
      );
      res.status(200).json({ updatedUserInfo });
    }
  } catch (error) {
    console.log(error);
  }
});

/* --- PUT: Route to update placesVisit of the user --- */
router.put("/mymap/updateVisit/:userId", isAuthenticated, async (req, res) => {
  const userId = req.params.userId;
  const { newPlacesVisit } = req.body; // Id of the place

  try {
    // Find the user
    const user = await User.findById(userId);

    // Checks on the place is already existed, if so, update the user's information
    if (user.placesVisit.includes(newPlacesVisit._id)) {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $pull: { placesVisit: newPlacesVisit._id } },
        {
          new: true, // Returns the updated document
          runValidators: true, // Runs Mongoose validators on the update
        }
      );
      res.status(200).json({ updatedUser });
    }
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

router.post("/places/:id", isAuthenticated, (req, res, next) => {
  const { comment } = req.body;

  Post.create({ user: payload, comment, place: req.params.id })
    .then((newPost) => {
      return Place.findByIdAndUpdate(req.params.id, {
        $push: { post: newPost._id },
      });
    })
    .then((response) => res.json(response))
    .catch((err) => res.json(err));
});

module.exports = router;
