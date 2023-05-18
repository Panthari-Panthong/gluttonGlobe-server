const router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User.model");

const saltRounds = 10;

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

  try {
    // Check the users collection if a user with the same email already exists
    const foundUser = await User.findOne({ email });

    if (foundUser) {
      res.status(400).json({ message: "User already exists." });
      return;
    }

    // If the email is unique, proceed to hash the password
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync(password, salt);

    // Create a new user in the database
    // We return a pending promise, which allows us to chain another `then`
    const createdUser = await User.create({
      email,
      password: hashedPassword,
      username,
    });

    // Send a json response containing the user object
    res.status(201).json({ message: "User create" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;

  if (email === "" || password === "") {
    res.status(400).json({ message: "Provide email and password." });
    return;
  }

  try {
    /* Try to get your user from the DB */
    const foundUser = await User.findOne({ email });

    /* If your user exists, check if the password is correct */
    if (!foundUser) {
      // If the user is not found, send an error response
      res.status(401).json({ message: "User not found." });
      return;
    }

    /* If your password is correct, sign the JWT using jsonwebtoken */
    const passwordCorrect = bcrypt.compareSync(password, foundUser.password);

    if (passwordCorrect) {
      const { _id, email, name } = foundUser;
      const payload = { _id, email, name };

      const authToken = jwt.sign(
        {
          expiresIn: "6h",
          user: payload, // Put yhe data of your user in there
        },
        process.env.TOKEN_SECRET,
        {
          algorithm: "HS256",
        }
      );

      res.status(200).json({ message: "User login" });
    } else {
      res.status(401).json({ message: "Unable to authenticate the user" });
    }
  } catch (error) {
    console.log(error);
    // res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
