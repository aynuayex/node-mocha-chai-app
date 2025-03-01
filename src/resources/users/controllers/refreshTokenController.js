const jwt = require("jsonwebtoken");

const User = require("../model");
const logger = require("../../../config/logger");

const handleRefreshToken = async (req, res) => {
  try {
    logger.info("New RefreshToken request received");
    const cookies = req.cookies;
    // console.log(cookies);
    if (!cookies?.jwt) return res.sendStatus(401);
    console.log(cookies.jwt);
    const refreshToken = cookies.jwt;
    res.clearCookie("jwt", { httpOnly: true, sameSite: "None", 
      // secure: true
     });

    const foundUser = await User.findOne({
      refreshToken: { $in: [refreshToken] },
    });
    console.log(foundUser);
    // Detected refresh token reuse!
    if (!foundUser) {
      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
          if (err) return res.sendStatus(403); //forbidden(expired)
          const { fullName, email } = decoded.userInfo;

          const hackedUser = await User.findByOneAndUpdate(
            { email, fullName },
            { $set: { refreshToken: [] } },
            { new: true }
          );
          console.log(hackedUser);
        }
      );
      return res.sendStatus(403); //forbidden
    }
    const newRefreshTokenArray = foundUser.refreshToken.filter(
      (rt) => rt != refreshToken
    );
    //evaluate jwt
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        if (err) {
          //forbidden(expired)
          const { fullName, email } = foundUser;
          const expiredTokenUser = await User.findByOneAndUpdate(
            { email, fullName },
            { $set: { refreshToken: [...newRefreshTokenArray] } },
            { new: true }
          );
          console.log(expiredTokenUser);
        }
        if (err || foundUser.fullName !== decoded.userInfo.fullName) {
          return res.sendStatus(403);
        }
        // refreshToken was still valid
        const { fullName, email } = decoded.userInfo;
        const accessToken = jwt.sign(
          { userInfo: { fullName, email } },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "1h" }
        );

        const newRefreshToken = jwt.sign(
          { userInfo: { fullName, email } },
          process.env.REFRESH_TOKEN_SECRET,
          { expiresIn: "1d" }
        );

        // Saving newRefreshToken with current user
        const result = await User.findOneAndUpdate(
          { email, fullName },
          {
            $set: { refreshToken: [...newRefreshTokenArray, newRefreshToken] },
          },
          { new: true }
        );
        console.log(result);

        res.cookie("jwt", newRefreshToken, {
          httpOnly: true,
          sameSite: "None",
          // secure: true, // comment this when using thunderclient to test refreshToken otherwise cookie will not be set on req.cookies
          maxAge: 24 * 60 * 60 * 1000,
        });
        res.json({
          id: result.id,
          email: result.email,
          fullName: result.fullName,
          accessToken,
        });
      }
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { handleRefreshToken };
