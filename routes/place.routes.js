const router = require("express").Router();
// Implment isAuthenticated when the test is done
//const { isAuthenticated } = require("../middleware/jwt.middleware");
const User = require("../models/User.model");
const Place = require("../models/Place.Model");
const mongoose = require("mongoose");

router.get("/places", async (req, res, next) => {
  try {
    const response = await Place.find();
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

module.exports = router;
