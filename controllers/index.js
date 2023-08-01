const { User } = require("../models");

class Controller {
  static async register(req, res, next) {
    try {
      const { email, username, password } = req.body;
      await User.create({
        email,
        username,
        password,
      });
      res.status(201).json({
        message: "Registration succeed!",
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = Controller;
