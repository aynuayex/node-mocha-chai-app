const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../model");
const logger = require("../../../config/logger");

const handleLogin = async (req, res) => {
  try {
    logger.info("User Login request received");
    const cookie = req.cookies;
    console.log(req.body);
    const { email, password } = req.body;

    const foundUser = await User.findOne({ email });
    if (!foundUser) return res.sendStatus(401); //unAuthorized
    //evaluate password
    const match = await bcrypt.compare(password, foundUser?.password);
    if (!match) return res.sendStatus(401);
    // if (!foundUser.emailVerified) return res.sendStatus(403); //forbiden
    // create JWTs
    const accessToken = jwt.sign(
      { userInfo: { fullName: foundUser.fullName, email } },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );
    const newRefreshToken = jwt.sign(
      { userInfo: { fullName: foundUser.fullName, email } },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    // Saving refreshToken with current user
    let newRefreshTokenArray = !cookie.jwt
      ? foundUser.refreshToken
      : foundUser.refreshToken.filter((rt) => rt !== cookie.jwt);
    if (cookie?.jwt) {
      /* 
            Scenario added here: 
                1) User logs in but never uses RT and does not logout 
                2) RT is stolen
                3) If 1 & 2, reuse detection is needed to clear all RTs when user logs in
            */
      const refreshToken = cookie.jwt;
      const foundToken = await User.findOne({
        email,
        refreshToken: { $in: [refreshToken] },
      });

      // Detected refresh token reuse!
      if (!foundToken) {
        console.log("attempted refresh token reuse at login!");
        // clear out ALL previous refresh tokens
        newRefreshTokenArray = [];
      }

      res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "None",
        // secure: true,
      });
    }

    const result = await User.findByIdAndUpdate(
      foundUser._id,
      { $set: { refreshToken: [...newRefreshTokenArray, newRefreshToken] } },
      { new: true }
    );

    console.log(result);

    res.cookie("jwt", newRefreshToken, {
      httpOnly: true,
      sameSite: "None",
      // secure: true, // comment this when using thunderclient to test refreshToken otherwise cookie will not be set on req.cookies
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
      success: `Success, Logged in as ${result.fullName}!`,
      id: result.id,
      fullName: result.fullName,
      email,
      accessToken,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { handleLogin };
