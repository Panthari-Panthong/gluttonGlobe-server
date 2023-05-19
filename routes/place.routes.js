const router = require("express").Router();
const Place = require("../models/Place.Model");

router.get("/places", async (req, res, next) => {
  try {
    const response = await Place.find();
    res.send({ data: response });
  } catch (error) {
    console.log(error);
  }
});

router.get("/places/:id", (req, res, next) => {
  Place.findById(req.params.id)
    .then((place) => res.status(200).json(place))
    .catch((error) => res.json(error));
});

module.exports = router;
