const { generateAccessToken } = require("../helpers/jwt");
const { User, Rental, Bicycle } = require("../models");

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

  static async startRental(req, res, next) {
    try {
      const UserId = req.user.id;
      const { travelledDistance, BicycleId } = req.body;
      await Rental.create({
        UserId,
        travelledDistance,
        BicycleId,
      });
      res.status(201).json({ message: "Your rental is being recorded" });
    } catch (error) {
      next(error);
    }
  }

  static async finishRental(req, res, next) {
    try {
      const id = req.params.id;
      const username = req.user.username;
      const { travelledDistance } = req.body;
      await Rental.update(
        {
          status: "Completed",
          travelledDistance,
        },
        {
          where: {
            id,
          },
        }
      );
      res
        .status(200)
        .json({ message: `Thank you ${username} for using our services` });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = Controller;
