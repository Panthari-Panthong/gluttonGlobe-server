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

module.exports = router;
