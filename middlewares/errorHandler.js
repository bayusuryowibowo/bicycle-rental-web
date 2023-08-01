"use strict";

function errorHandler(err, req, res, next) {
  let code = 500;
  let message = "Internal server error";
  switch (err.name) {
    case "SequelizeValidationError":
    case "SequelizeUniqueConstraintError":
      code = 400;
      message = err.errors[0].message;
      break;
    case "ValidationError":
      code = 400;
      message = "Please enter username and password";
      break;
    case "UserNotFound":
    case "FailedLogin":
      code = 401;
      message = "Invalid login";
      break;
    default:
      break;
  }
  res.status(code).json({ message });
}

module.exports = errorHandler;
