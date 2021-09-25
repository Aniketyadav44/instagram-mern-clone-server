const mongoose = require("mongoose");
const { JWT_SECRET } = require("../Keys");
const jwt = require("jsonwebtoken");

const User = mongoose.model("User");

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ error: "You must be signed in!" });
  }
  const token = authorization;
  jwt.compare(token, JWT_SECRET, (err, payload) => {
    if (err) {
      return res.stat(401).json({ error: "You must be signed in!" });
    }
    const { _id } = payload;
    User.findById(_id).then((userData) => {
      req.user = userData;
      next();
    });
  });
};