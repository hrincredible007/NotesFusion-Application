const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchuser = require("../middleware/fetchuser");

const JWT_SECRET = "HelloEveryone$20";

// ROUTE 1: Create a user using POST: "/api/auth/createUser". Does not require auth
router.post(
  "/createUser",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Invalid Email Format"),
    body("password")
      .isLength({ min: 5 })
      .withMessage(`The Password's Length must be greater than 4`),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    // If there are bad requests, return the bad request and the error in json.
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      console.log('Hello Everyone');
      //Check whether the user with the particular email exists or not.
      const newUser2 = await User.findOne({ email: req.body.email });
      // console.log(newUser, "Hritik Bhardwaj");
      if (newUser2) {
        return res
          .status(400)
          .json({ error: "Sorry, the user already exists with this username" });
      }
      // Generate the salt with bcryptjs
      const salt = await bcrypt.genSalt(10);
      secured_Password = await bcrypt.hash(req.body.password, salt);
      // Create a new user
      const newUser = await User.create({
        name: req.body.name,
        password: secured_Password,
        email: req.body.email,
      });

      const data = {
        newUser:{
            id: newUser.id
        }
      };
      const authtoken = jwt.sign(data, JWT_SECRET);
      console.log(authtoken);


       res.json({authtoken});
    } 
    catch (error) {
      console.error(error.message);
      return res.status(500).send("Internal Server Error");
    }
  }
);



// ROUTE 2: Authenticate a user using POST: "/api/auth/login". Does not require auth.
router.post("/login", 
  [body("email").isEmail().withMessage("Invalid Email Format"),
  body("password")
    .isLength({ min: 1 })
    .withMessage(`The Password can not be empty`),
  ], async(req, res)=>{

    const errors = validationResult(req);
    // If there are bad requests, return the bad request and the error in json.
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    //destructuring email and password from req.body.
    const {email, password} = req.body;
    try {
      // Check whether the particular email is already registered in the dB.
      const user = await User.findOne({email});
      // If the user is not registered in the dB.
      if(!user){
        return res.status(400).json({error: "Please try to login with the correct credentials"});
      }

      // Compare the password of the login and the dB registered one.
      const passwordCompare = await bcrypt.compare(password, user.password);

      // If the passwords did not match with each other.
      if(!passwordCompare){
        return res.status(400).json({error: "Please try to login with the correct credentials"});
      }
      
      const data = {
        user: {
          id: user.id
        }
      }
      const authToken = jwt.sign(data, JWT_SECRET);
      // console.log("Hello");
      res.json({authToken});
    }
    catch (error) {
      console.error(error.message);
      return res.status(500).send("Internal Server Error");
    }
  }
)

// ROUTE 3: Get the loggedIn user details using POST: "/api/auth/getuser". Require auth i.e. login
router.post('/getuser', fetchuser, async(req, res) =>{
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password');
    if(!user){
      return res.status(401).json({error: "Please authenticate using th avalid token"})
    }
    res.json(user);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send("Internal Server Error");

  }
})

module.exports = router;