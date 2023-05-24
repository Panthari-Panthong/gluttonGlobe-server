const Place = require("../models/Place.Model");
const Post = require("../models/Post.Model");

const router = require("express").Router();

router.post("/posts", async (req, res, next) => {
  try {
    const newPost = await Post.create(req.body);
    const response = await Place.findByIdAndUpdate(newPost.place, {
      $push: { post: newPost._id },
    });
    res.status(200).json(response);
  } catch (error) {
    res.json(error);
  }
});

router.delete("/posts/:postId", async (req, res, next) => {
  try {
    await Post.findByIdAndDelete(req.params.postId);
    res.status(200).json({ message: "Post succesfully deleted" });
  } catch (error) {
    res.json(error);
  }
});

module.exports = router;
