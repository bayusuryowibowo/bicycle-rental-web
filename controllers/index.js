const { generateAccessToken } = require("../helpers/jwt");
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

  static async login(req, res, next) {
    try {
      const { username, password } = req.body;
      if (!username || !password) throw { name: "ValidationError" };
      const data = await User.findOne({ where: { username } });
      if (!data) throw { name: "UserNotFound" };
      const isPasswordValid = data.verifyPassword(password);
      if (isPasswordValid) {
        var access_token = generateAccessToken(data);
      } else {
        throw { name: "FailedLogin" };
      }
      res.status(200).json({
        message: "Login succeed!",
        access_token,
        id: data.id,
        email: data.email,
        username: data.username,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = Controller;
