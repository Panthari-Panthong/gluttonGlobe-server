const router = require("express").Router();
const Place = require("../models/Place.Model");
const Post = require("../models/Post.Model");

router.get("/places", async (req, res, next) => {
  try {
    const response = await Place.find().populate("post");
    res.send({ data: response });
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

  Post.create({ user, comment, place: req.params.id })
    .then((newPost) => {
      return Place.findByIdAndUpdate(req.params.id, {
        $push: { post: newPost._id },
      });
    })
    .then((response) => res.json(response))
    .catch((err) => res.json(err));
});

module.exports = router;
