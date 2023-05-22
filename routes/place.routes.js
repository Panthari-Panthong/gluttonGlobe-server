const router = require("express").Router();
const Place = require("../models/Place.Model");
const Post = require("../models/Post.Model");

router.get("/places", async (req, res, next) => {
  try {
    const responsePlace = await Place.find();
    res.send({ data: responsePlace });
    const responsePost = await Post.find();
    res.send({ data: responsePost });
  } catch (error) {
    console.log(error);
  }
});

router.get("/places/:id", (req, res, next) => {
  Place.findById(req.params.id)
    .then((place) => res.status(200).json(place))
    .catch((error) => res.json(error));
});

router.post("/places/:id", (req, res, next) => {
  const { comment } = req.body;

  Post.create({ comment, place: req.params.id }) // + user to add if logged in
    .then((response) => res.json(response))
    .catch((err) => res.json(err));
});

module.exports = router;
