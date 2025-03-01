const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../model");
const logger = require("../../../config/logger");

const handleNewUser = async (req, res) => {
  try {
    logger.info("User registration request received");
    console.log(req.body);
    const { fullName, email, password } = req.body;

    //check for duplicate users in the db
    const duplicate = await User.findOne({ email }).exec();
    if (duplicate)
      return res.status(409).json({
        message:
          "user already exist with that information, Please change Email!",
      }); //Conflict
    // encrypt password
    const hashedPwd = await bcrypt.hash(password, 10);

    // create JWTs
    const accessToken = jwt.sign(
      { userInfo: { fullName, email } },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );
    const refreshToken = jwt.sign(
      { userInfo: { fullName, email } },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    // create and store the new user
    const result = await User.create({
      fullName,
      email,
      password: hashedPwd,
      refreshToken: [refreshToken],
    });
    console.log(result);

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      sameSite: "None",
      // secure: true, // comment this when using thunderclient to test refreshToken otherwise cookie will not be set on req.cookies
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "User registered successfully",
      success: `New user ${fullName} created!`,
      id: result.id,
      fullName,
      email,
      accessToken,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { handleNewUser };
