const express = require("express");
const {
  login,
  register,
  user,
  profileImg,
  deleteUser,
} = require("../controllers/auth");
const { protect, upload } = require("../middleware/auth");

const router = express.Router();

router.route("/login").post(login);
router.route("/register").post(register);
router.route("/profile").get(protect, user);
router
  .route("/update-profileImg")
  .patch(upload.single("profileImg"), profileImg);

router.route("/delete-user").delete(deleteUser);

module.exports = router;
