const Place = require("../models/Place.Model");
const Post = require("../models/Post.Model");

const router = require("express").Router();

router.post("/posts", async (req, res, next) => {
  console.log(req.body);
  try {
    const newPost = await Post.create(req.body);
    const response = await Place.findByIdAndUpdate(newPost.place, {
      $push: { post: newPost._id },
    });
    res.json(response);
  } catch (error) {
    res.json(error);
  }
});

module.exports = router;
