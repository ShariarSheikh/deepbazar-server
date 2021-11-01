const jwt = require("jsonwebtoken");
const AuthModel = require("../models/AuthSchema");
const ErrorResponse = require("../utils/ErrorResponse");
const multer = require("multer");

//protect user
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new ErrorResponse("Not authorization to access", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await AuthModel.findById(decoded.id);

    if (!user) {
      return next(new ErrorResponse("Not authorization to access", 401));
    }

    req.user = user;

    next();
  } catch (error) {
    return next(new ErrorResponse("Not authorization to access", 401));
  }
};

//user upload file

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "upload/user_profile");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "--" + file.originalname);
  },
});

exports.upload = multer({
  storage: storage,
  limits: {
    fieldSize: 1024 * 1024 * 5,
  },
});
