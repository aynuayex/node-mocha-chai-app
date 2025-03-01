const logger = require("../config/logger");
const {
  newUserSchema,
  loginUserSchema,
} = require("../resources/users/validation");

const validateUser = (req, res, next) => {
  const schema = req.path === "/register" ? newUserSchema : loginUserSchema;

  const { error } = schema.validate(req.body);
  if (error) {
    logger.error(error.details[0].message)
    return res.status(400).json({ message: error.details[0].message });
  }

  next();
};

module.exports = validateUser;
