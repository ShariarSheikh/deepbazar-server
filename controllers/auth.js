const AuthModel = require("../models/AuthSchema");
const mongoose = require("mongoose");
const { unlink } = require("fs").promises;

//login users
exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res
        .status(401)
        .json({ success: false, message: "Please provide email and password" });
    } else {
      const user = await AuthModel.findOne({ email }).select("+password");
      if (!user) {
        res
          .status(401)
          .json({ success: false, message: "Invalid credentials" });
      }

      const isMatch = await user.matchPasswords(password);

      if (!isMatch) {
        res
          .status(401)
          .json({ success: false, message: "Invalid credentials" });
      }

      sendToken(user, 200, res);
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//create new users
exports.register = async (req, res, next) => {
  const { name, email, number, password } = req.body;

  const profileImg = "";
  const imagesFileName = "";

  const accountType = {
    user: process.env.ACCOUNT_TYPE_USER,
    isAdmin: process.env.ACCOUNT_TYPE_IS_ADMIN,
  };

  try {
    if (!name || !email || !password || !number) {
      return res.status(401).json({
        success: false,
        message: "Please provide name mobile email and password",
      });
    }

    const user = await AuthModel.create({
      name,
      email,
      number,
      password,
      profileImg,
      imagesFileName,
      accountType,
    });
    sendToken(user, 200, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//create jsonwebtoken
const sendToken = async (user, statusCode, res) => {
  const token = await user.getSignedToken();
  res.status(statusCode).json({ success: true, token: token });
};

//get user
exports.user = async (req, res, next) => {
  const user = {
    name: req.user.name,
    email: req.user.email,
    number: req.user.number,
    profileImg: req.user.profileImg,
    id: req.user._id,
  };

  if (
    req.user.accountType.isAdmin &&
    req.user.email === process.env.ADMIN_EMAIL
  ) {
    res.status(200).json({
      success: true,
      data: {
        message: `Welcome Admin ${req.user.name}`,
        user,
        isAdmin: true,
      },
    });
  } else {
    res.status(200).json({
      success: true,
      data: { message: `Welcome ${req.user.name}`, user },
    });
  }
};

//upload user profile profileImg
exports.profileImg = async (req, res, next) => {
  const { id: _id, imagesFileName, isUpload } = req.body;

  const update = {
    profileImg: isUpload
      ? `http://localhost:9000/user_profile/${req.file.filename}`
      : "",
    imagesFileName: isUpload ? req.file.filename : "",
  };

  try {
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      res
        .status(404)
        .json({ success: false, message: "Not found with this id" });
    } else {
      if (imagesFileName) {
        await unlink("upload/user_profile/" + imagesFileName);
      }

      const updateImg = await AuthModel.findByIdAndUpdate(_id, update, {
        new: true,
      });

      if (!updateImg) {
        await unlink("upload/user_profile/" + req.file.filename);
        return res
          .status(404)
          .json({ success: false, message: "Not found with this id" });
      } else {
        res.status(200).json({
          success: true,
          message: isUpload ? "Uploaded successfully" : "Deleted successfully",
          updateImg,
        });
      }
    }
  } catch (error) {
    await unlink("upload/user_profile/" + req.file.filename);
    res.status(500).json({ success: false, message: error.message });
  }
};

//delete user account
exports.deleteUser = async (req, res, next) => {
  const id = req.query.id;
  const imagesFileName = req.query.imagesFileName;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res
        .status(404)
        .json({ success: false, message: "Not found with this id" });
    }
    await AuthModel.findByIdAndDelete(id);

    if (imagesFileName) {
      await unlink("upload/user_profile/" + imagesFileName);
    }
    res.status(200).json({ success: true, message: "Your Account deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
