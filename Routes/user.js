const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const requireLogin = require("../Middlewares/requireLogin");

const Post = mongoose.model("Post");
const User = mongoose.model("User");

//route to get user details by passing username
router.get("/user/:userId", requireLogin, (req, res) => {
  User.findOne({ _id: req.params.userId })
    .select("-password")
    .then((user) => {
      Post.find({ owner: req.params.userId })
        .populate("owner", "_id username photoUrl verified followers")
        .populate("comments.postedBy", "_id username photoUrl verified")
        .exec((err, posts) => {
          if (err) {
            return res.status(422).json({ error: err });
          }
          res.json({ user, posts });
        });
    })
    .catch((err) => {
      console.log(err);
    });
});

//route to follow user
router.put("/follow", requireLogin, (req, res) => {
  User.findByIdAndUpdate(
    req.body.followId,
    {
      $push: { followers: req.user._id },
    },
    { new: true },
    (err, result) => {
      if (err) {
        return res.status(422).json({ error: err });
      }
      User.findByIdAndUpdate(
        req.user._id,
        {
          $push: { following: req.body.followId },
        },
        { new: true }
      )
        .select("-password")
        .then((result) => {
          res.json(result);
        })
        .catch((err) => console.log(err));
    }
  );
});

//router to unfollow user
router.put("/unfollow", requireLogin, (req, res) => {
  User.findByIdAndUpdate(
    req.body.unfollowId,
    {
      $pull: { followers: req.user._id },
    },
    { new: true },
    (err, result) => {
      if (err) {
        return res.status(422).json({ error: err });
      }
      User.findByIdAndUpdate(req.user._id, {
        $pull: { following: req.body.unfollowId },
      })
        .select("-password")
        .then((result) => {
          res.json(result);
        })
        .catch((err) => console.log(err));
    }
  );
});

//route to get userlist by passing user ids in params
router.get("/userlist/:arrayparams", requireLogin, (req, res) => {
  const stringSplit = req.params.arrayparams.split(",");
  const objectArray = stringSplit.map((string) =>
    mongoose.Types.ObjectId(string)
  );
  User.find({ _id: { $in: objectArray } })
    .select("-password")
    .then((result) => {
      res.json(result);
    })
    .catch((err) => console.log(err));
});

module.exports = router;