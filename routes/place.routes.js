const router = require("express").Router();
// Implment isAuthenticated when the test is done
//const { isAuthenticated } = require("../middleware/jwt.middleware");
const User = require("../models/User.Model");
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
    const placesBeenFromUser = await User.aggregate([
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
        $unwind: "$placesBeenFromUser",
      },
      {
        $project: {
          _id: 0,
          city: "$placesBeenFromUser.city",
          lat: "$placesBeenFromUser.lat",
          lng: "$placesBeenFromUser.lng",
        },
      },
    ]);

    const placesVisitFromUser = await User.aggregate([
      { $match: { _id: new ObjectId(userId) } },
      {
        $lookup: {
          from: "places",
          as: "placesVisitFromUser",
          localField: "placesVisit",
          foreignField: "_id",
        },
      },
      {
        $unwind: "$placesVisitFromUser",
      },
      {
        $project: {
          _id: 0,
          city: "$placesVisitFromUser.city",
          lat: "$placesVisitFromUser.lat",
          lng: "$placesVisitFromUser.lng",
        },
      },
    ]);

    res.status(200).json({ placesBeenFromUser, placesVisitFromUser });

    //res.send({ data: savedPlaces });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Error fetching places saved by the users" });
  }
});

module.exports = router;
