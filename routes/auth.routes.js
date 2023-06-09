const router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User.model");
const Place = require("../models/Place.Model");

const { isAuthenticated } = require("./../middleware/jwt.middleware");

// ********* require fileUploader in order to use it *********
const fileUploader = require("../config/cloudinary.config");

// POST /auth/signup  - Creates a new user in the database
router.post("/signup", async (req, res, next) => {
  const { email, password, username } = req.body;

  // Check if the email or password or name is provided as an empty string
  if (email === "" || password === "" || username === "") {
    res.status(400).json({ message: "Provide email, password and name" });
    return;
  }

  // Use regex to validate the email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: "Provide a valid email address." });
    return;
  }

  // Use regex to validate the password format
  const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!passwordRegex.test(password)) {
    res.status(400).json({
      message:
        "Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter.",
    });
    return;
  }

  try {
    // Check the users collection if a user with the same email already exists
    const foundUser = await User.findOne({ email });

    if (foundUser) {
      res.status(400).json({ message: "User already exists." });
      return;
    }

    // If the email is unique, proceed to hash the password
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync(password, salt);

    // Create a new user in the database
    const createdUser = await User.create({
      email,
      password: hashedPassword,
      username,
    });

    // Send a json response containing the user object
    res.status(201).json({ message: "New user created" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email or password are provided as empty string
  if (email === "" || password === "") {
    res.status(400).json({ message: "Provide email and password." });
    return;
  }
  try {
    // Check the users collection if a user with the same email exists
    const foundUser = await User.findOne({ email });

    if (!foundUser) {
      // If the user is not found, send an error response
      res.status(401).json({ message: "User not found." });
      return;
    }

    // Compare the provided password with the one saved in the database
    const passwordCorrect = bcrypt.compareSync(password, foundUser.password);

    if (passwordCorrect) {
      // Deconstruct the user object to omit the password
      const { _id, email, name } = foundUser;

      // Create an object that will be set as the token payload
      const payload = { _id, email, name };

      // Create and sign the token
      const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
        algorithm: "HS256",
        expiresIn: "6h",
      });

      // Send the token as the response
      res.status(200).json({ authToken: authToken });
    } else {
      res.status(401).json({ message: "Unable to authenticate the user" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// GET  /auth/verify  -  Used to verify JWT stored on the client
router.get("/verify", isAuthenticated, (req, res, next) => {
  // If JWT token is valid the payload gets decoded by the
  // isAuthenticated middleware and made available on `req.payload`
  // console.log(`req.payload`, req.payload);

  // Send back the object with user data
  // previously set as the token payload
  res.status(200).json(req.payload);
});

// Cloudinary uploaded
router.post("/upload", fileUploader.single("imageUrl"), (req, res, next) => {
  if (!req.file) {
    next(new Error("No file uploaded!"));
    return;
  }

  // Get the URL of the uploaded file and send it as a response.
  // 'fileUrl' can be any name, just make sure you remember to use the same when accessing it on the frontend
  res.json({ fileUrl: req.file.path });
});

// GET  /auth/profile/:userId  -  Used to verify JWT stored on the client
router.get("/profile/:userId", isAuthenticated, async (req, res, next) => {
  const { userId } = req.params;

  try {
    const response = await User.findById(userId)
      .populate("placesBeen")
      .populate("placesVisit");
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/profile/:userId/edit", isAuthenticated, async (req, res, next) => {
  const { userId } = req.params;

  try {
    const response = await User.findById(userId);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.put("/profile/:userId/edit", isAuthenticated, async (req, res, next) => {
  const { userId } = req.params;
  const { about, picture, username } = req.body;
  try {
    const response = await User.findByIdAndUpdate(
      userId,
      {
        ...req.body,
        about,
        picture,
        username,
      },
      {
        new: true,
      }
    );
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
