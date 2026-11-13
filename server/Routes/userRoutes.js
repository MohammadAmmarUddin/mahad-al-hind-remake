const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  signupUser,
  loginUser,
  getAllUsers,
  getAllUsersCount,
  deleteUser,
  getSingleUser,
  makeAdmin,
  undoAdmin,
  forgetPassword,
  resetPassword,
  updateUser,
  changePassword,
  googleLogin,
  deleteMyAccount,
  updateLanguagePreference,
  changeUserRole,
} = require("../Controllers/userController.js");

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // Limit to 5 requests per window
  message: "Too many login attempts, please try again later.",
});

// Google sign-in is a separate credential path, so it gets its own budget.
// Higher than password login because a flaky network can retry a valid login.
const googleLoginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 15,
  message: "Too many sign-in attempts, please try again later.",
});

//post
router.post("/signup", loginLimiter, signupUser);
router.post("/login", loginLimiter, loginUser);
router.post("/googleLogin", googleLoginLimiter, googleLogin);
router.post("/forgetPassword", forgetPassword);
router.post("/resetPassword/:token", resetPassword);

//get
router.get("/allUsers", getAllUsers);
router.get("/allUsersCount", getAllUsersCount);
router.get("/singleUser/:id", getSingleUser);

//delete
router.delete("/deleteUser/:id", deleteUser);
router.delete("/deleteMyAccount", deleteMyAccount);

//patch
router.patch("/makeAdmin/:id", makeAdmin);
router.patch("/undoAdmin/:id", undoAdmin);
router.patch("/updateUser/:id", updateUser);
router.patch("/changePassword", changePassword);
router.patch("/languagePreference/:id", updateLanguagePreference);
router.patch("/changeRole/:id", changeUserRole);

module.exports = router;
