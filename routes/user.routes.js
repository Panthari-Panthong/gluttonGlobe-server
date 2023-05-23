const User = require("../models/User.model");

const router = require("express").Router();

router.get("/users", async (req, res, next) => {
  try {
    const response = await User.find();
    res.send({ data: response });
  } catch (error) {
    console.log(error);
  }
});

router.get("/users/:id", async (req, res, next) => {
  try {
    const response = await User.findById(req.params.id);
    res.send({ data: response });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
