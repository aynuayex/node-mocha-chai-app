const User = require("../model");

const logger = require("../../../config/logger");

const handleLogout = async (req, res) => {
  try {
    logger.info("User Logout request received");
    // On client, also delete the accessToken
    // console.log(req);
    const cookies = req.cookies;
    // console.log(cookies);
    if (!cookies?.jwt) return res.sendStatus(204); // No content
    const refreshToken = cookies.jwt;

    // is refreshToken in db?
    const foundUser = await User.findOne({
      refreshToken: { $in: [refreshToken] },
    });
    if (!foundUser) {
      res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "None",
        // secure: true,
      });
      return res.sendStatus(204);
    }

    //delete refrshToken in db
    newRefreshTokenArray = foundUser.refreshToken.filter(
      (rt) => rt != refreshToken
    );
    const result = await User.findByIdAndUpdate(
      foundUser._id,
      { $set: { refreshToken: newRefreshTokenArray } },
      { new: true }
    );

    console.log(result);
    res.clearCookie("jwt", { httpOnly: true, sameSite: "None", 
      // secure: true
     }); // secure: true - only serves on https
    return res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { handleLogout };
