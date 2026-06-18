const mongoose = require("mongoose");
const userModel = require("../Models/userModel.js");
const courseModel = require("../Models/courseModel.js");
const notificationModel = require("../Models/notificationModel.js");
const galleryItemModel = require("../Models/galleryItemModel.js");
const PaymentSession = require("../Models/paymentSessionModel.js");
const { createNotification } = require("../Controllers/notificationController");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const {
  destroyCloudinaryAsset,
  normalizeUploadInput,
  uploadToCloudinary,
} = require("../Utils/cloudinary");

const DeviceDetector = require("device-detector-js");
const deviceDetector = new DeviceDetector();

// nodemailer welcome message
const transporter = nodemailer.createTransport({
  service: "gmail", // or another email service
  auth: {
    user: "ammaraslam7164@gmail.com",
    pass: "wefopxlsdumlohpx",
  },
});

// Send welcome email function
const sendWelcomeEmail = (userEmail, userName) => {
  const mailOptions = {
    from: "ammaraslam7164@gmail.com", // sender's email
    to: userEmail, // receiver's email
    subject: "Welcome to Our Website!",
    html: `
      <h2>Hello ${userName},</h2>
      <p>Welcome to our website! We are excited to have you on board.</p>
      <p>Feel free to explore and let us know if you need any help.</p>
      <p>Best regards,<br/>Safara Academy</p>
    `,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error sending email:", error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

const createToken = (user) => {
  return jwt.sign(
    { _id: user._id, role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "3d" }
  );
};

const isCloudinaryUrl = (value = "") =>
  /res\.cloudinary\.com/i.test(String(value || ""));

const persistProfileImage = async (image, previousPublicId = "") => {
  const normalized = normalizeUploadInput(image, {
    mimeType: "image/jpeg",
  });

  if (!normalized) {
    return {
      img: image || "",
      imgPublicId: previousPublicId || "",
    };
  }

  if (/^https?:\/\//i.test(normalized) && isCloudinaryUrl(normalized)) {
    return {
      img: normalized,
      imgPublicId: previousPublicId || "",
    };
  }

  const uploaded = await uploadToCloudinary(normalized, {
    folder: "users/profiles",
    resourceType: "image",
    originalName: "profile-image",
    mimeType: "image/jpeg",
  });

  if (previousPublicId) {
    try {
      await destroyCloudinaryAsset(previousPublicId, "image");
    } catch (error) {
      console.warn("Failed to delete previous profile image:", error.message);
    }
  }

  return {
    img: uploaded.url,
    imgPublicId: uploaded.publicId,
  };
};

const signupUser = async (req, res) => {
  const { firstname, lastname, email, phone, role, prevRole, img, password } =
    req.body;
  console.log("🚀 ~ signupUser ~ req.body:", req.body);
  try {
    const user = await userModel.signup(
      firstname,
      lastname,
      email,
      phone,
      role,
      prevRole,
      img,
      password
    );
    const token = createToken(user);
    res.status(200).json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { firstname, lastname, email, phone, role, prevRole, img } = req.body;

    if (!email) {
      console.error("Missing email in request body:", req.body);
      return res.status(400).json({ error: "Email is required" });
    }

    // Check if user exists
    let user = await userModel.findOne({ email });
    let isNewUser = false;

    if (!user) {
      // Create new user if doesn't exist
      isNewUser = true;
      user = await userModel.create({
        firstname,
        lastname,
        email,
        phone,
        role,
        prevRole,
        img,
      });
    }

    // Generate token
    const token = createToken(user._id);

    // Return user data and token
    res.status(200).json({
      user: {
        ...user.toObject(),
        isNewUser,
      },
      token,
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(400).json({ error: error.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.login(email, password);
    // Detect the device type

    const token = createToken(user);
    if (user && token) {
      sendWelcomeEmail(email, user.firstname);
    }
    res.status(200).json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find({});
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSingleUser = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid ID" });
  }
  const user = await userModel.findById(id);
  if (user) {
    res.status(200).json(user);
  } else {
    return res.status(400).json({ error: "No Such user Found" });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid ID" });
  }

  // ─── CONCURRENT CLEANUP: remove all references to this user ───
  try {
    // 1. Courses: remove from instructorsId arrays
    await courseModel.updateMany({ instructorsId: id }, { $pull: { instructorsId: id } });

    // 2. Courses: remove student enrollment entries
    await courseModel.updateMany({ "students.studentsId": id }, { $pull: { students: { studentsId: id } } });

    // 3. Courses: remove student reviews/opinions
    await courseModel.updateMany({ "studentsOpinion.reviewerId": id }, { $pull: { studentsOpinion: { reviewerId: id } } });

    // 4. Notifications: delete all notifications belonging to this user
    await notificationModel.deleteMany({ userId: id });

    // 5. Gallery items: null out uploadedBy references
    await galleryItemModel.updateMany({ uploadedBy: id }, { $set: { uploadedBy: null } });

    // 6. Payment sessions: delete all payment records for this user
    try {
      const PaymentSession = mongoose.model("PaymentSession");
      await PaymentSession.deleteMany({ studentsId: id });
    } catch (_) {
      // PaymentSession model may not be registered yet — skip silently
    }
  } catch (cleanupErr) {
    console.error("User delete cleanup error:", cleanupErr);
  }

  const deletedUser = await userModel.findOneAndDelete({ _id: id });
  if (deletedUser) {
    res.status(200).json(deletedUser);
  } else {
    return res.status(400).json({ error: "No Such user Found" });
  }
};

const makeAdmin = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid ID." });
  }
  const { role } = req.body;
  if (!role) {
    return res.status(400).json({ error: "Role is required." });
  }
  const user = await userModel.findOneAndUpdate(
    { _id: id },
    { role: "admin" },
    { new: true }
  );
  if (user) {
    res.status(200).json(user);
  } else {
    return res.status(400).json({ error: "No Such User Found." });
  }
};

const undoAdmin = async (req, res) => {
  const { id } = req.params;

  // Validate the provided ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid ID." });
  }

  try {
    const prevUser = await userModel.findById(id);
    const user = await userModel.findOneAndUpdate(
      { _id: id },
      { role: prevUser.prevRole },
      { new: true }
    );
    console.log("🚀 ~ undoAdmin ~ user:", user);

    if (user) {
      res.status(200).json(user);
    } else {
      return res.status(400).json({ error: "No Such User Found." });
    }
  } catch (error) {
    res.status(500).json({ error: "Server error." });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid ID" });
  }

  try {
    const updatedUser = await userModel.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (updatedUser) {
      res.status(200).json(updatedUser);
    } else {
      return res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// forget password

const forgetPassword = async (req, res) => {
  const { email } = req.body;

  const user = await userModel.findOne({ email });
  if (!user) {
    return res.json({ message: "user not registered" });
  }
  const token = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "5m",
  });
  console.log(token);

  var transporter = nodemailer.createTransport({
    auth: {
      user: "ammaraslam7164@gmail.com",
      pass: "wefopxlsdumlohpx",
    },
  });

  var mailOptions = {
    from: "ammaraslam7164@gmail.com",
    to: email,
    subject: "Sending Email for reset password",
    text: `${process.env.BASE_URL}/resetPassword/${token}`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      res.send({ status: false, message: "error sending mail" });
    } else {
      console.log("Email sent: " + info.response);
      res.send({ status: true, message: "successfully sent!!" });
    }
  });
};

// reset password

const resetPassword = async (req, res) => {
  const { token } = req.params;

  const { password } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const id = decoded.id;
    const hashPassword = await bcrypt.hash(password, 10);

    await userModel.findByIdAndUpdate({ _id: id }, { password: hashPassword });

    return res.json({ status: true, message: "successfully reset!" });
  } catch (err) {
    console.log(err);

    res.send({ status: false, message: "Something went wrong!" });
  }
};
// user count
const getAllUsersCount = async (req, res) => {
  const usersCount = await userModel.estimatedDocumentCount();
  res.send({ usersCount });
};

// Change Password API
const changePassword = async (req, res) => {
  console.log("change password api hitted");
  const { oldPassword, newPassword, retypePassword, id } = req.body;
  const userId = id;
  console.log(oldPassword, newPassword);

  // Validate input fields
  if (!oldPassword || !newPassword || !retypePassword) {
    return res.status(400).json({ error: "All fields are required." });
  }

  if (newPassword !== retypePassword) {
    return res
      .status(400)
      .json({ error: "New password and confirmation do not match." });
  }

  // Get the authenticated user's ID (replace with your authentication logic)

  console.log("id", userId);

  // Find user by ID
  const user = await userModel.findById(userId);
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  // Check if the old password is correct
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    return res.status(400).json({ error: "Old password is incorrect." });
  }

  // Hash the new password

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update the user's password
  user.password = hashedPassword;
  await user.save();

  res.status(200).json({ message: "Password updated successfully." });
};

const deleteMyAccount = async (req, res) => {
  try {
    console.log("Delete account API hit");

    const { password, id } = req.body;

    if (!password || !id) {
      return res.status(400).json({
        error: "Password and user ID are required to perform this operation.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid user ID." });
    }

    // Find user by ID
    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Check if the password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Incorrect password." });
    }

    // ─── CONCURRENT CLEANUP: remove all references to this user ───
    try {
      await courseModel.updateMany({ instructorsId: id }, { $pull: { instructorsId: id } });
      await courseModel.updateMany({ "students.studentsId": id }, { $pull: { students: { studentsId: id } } });
      await courseModel.updateMany({ "studentsOpinion.reviewerId": id }, { $pull: { studentsOpinion: { reviewerId: id } } });
      await notificationModel.deleteMany({ userId: id });
      await galleryItemModel.updateMany({ uploadedBy: id }, { $set: { uploadedBy: null } });
      try {
        const PaymentSession = mongoose.model("PaymentSession");
        await PaymentSession.deleteMany({ studentsId: id });
      } catch (_) {}
    } catch (cleanupErr) {
      console.error("User delete cleanup error:", cleanupErr);
    }

    // Delete the user
    await userModel.findByIdAndDelete(id);
    res.status(200).json({ message: "User account deleted successfully." });
  } catch (error) {
    console.error("Error deleting user:", error);
    res
      .status(500)
      .json({ error: "An error occurred. Please try again later." });
  }
};

const updateLanguagePreference = async (req, res) => {
  const { id } = req.params;
  const { preferredLanguage } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid ID" });
  }

  if (!["en", "bn"].includes(preferredLanguage)) {
    return res.status(400).json({ error: "Invalid language selection" });
  }

  try {
    const updatedUser = await userModel.findByIdAndUpdate(
      id,
      { preferredLanguage },
      { new: true },
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const signupUserV2 = async (req, res) => {
  const { firstname, lastname, email, phone, role, prevRole, img, password } =
    req.body;

  try {
    const imageResult = await persistProfileImage(img || "", "");
    const user = await userModel.signup(
      firstname,
      lastname,
      email,
      phone,
      role,
      prevRole,
      imageResult.img,
      imageResult.imgPublicId,
      password,
    );

    const token = createToken(user);

    createNotification({
      role: "admin",
      type: "new_signup",
      message: `New user registered: ${user.firstname} ${user.lastname} (${user.email})`,
      link: "/dashboard/admin/allUsers",
      relatedId: String(user._id),
    });

    res.status(200).json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const verifyGoogleToken = async (idToken) => {
  const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Invalid Google token: ${text}`);
  }
  return await response.json();
};

const googleLoginV2 = async (req, res) => {
  try {
    const { idToken, firstname, lastname, email, phone, role, prevRole, img } = req.body;

    let finalEmail, finalFirstname, finalLastname, finalImg, finalRole;

    if (idToken) {
      // Mobile app flow: verify the Google ID token and extract user info
      const googleUser = await verifyGoogleToken(idToken);

      if (!googleUser.email) {
        return res.status(400).json({ error: "Could not extract email from Google token" });
      }

      finalEmail = googleUser.email;
      const name = googleUser.name || '';
      const photoUrl = googleUser.picture || '';

      const nameParts = name.split(' ');
      finalFirstname = nameParts[0] || 'User';
      finalLastname = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Unknown';
      finalImg = photoUrl;
      finalRole = 'student';
    } else if (email) {
      // Web client flow: use user data directly (from Firebase Auth)
      finalEmail = email;
      finalFirstname = firstname || 'Unknown';
      finalLastname = lastname || 'Unknown';
      finalImg = img || '';
      finalRole = role || 'user';
    } else {
      return res.status(400).json({ error: "Either idToken or email is required" });
    }

    let user = await userModel.findOne({ email: finalEmail });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = await userModel.create({
        firstname: finalFirstname,
        lastname: finalLastname,
        email: finalEmail,
        phone: phone || undefined,
        role: finalRole,
        prevRole,
        img: finalImg,
      });
    }

    const token = createToken(user);

    if (isNewUser) {
      createNotification({
        role: "admin",
        type: "new_signup",
        message: `New user registered: ${user.firstname} ${user.lastname} (${user.email})`,
        link: "/dashboard/admin/allUsers",
        relatedId: String(user._id),
      });
    }

    res.status(200).json({
      user: {
        ...user.toObject(),
        isNewUser,
      },
      token,
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(400).json({ error: error.message });
  }
};

const updateUserV2 = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid ID" });
  }

  try {
    const currentUser = await userModel.findById(id);
    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const payload = { ...req.body };
    const incomingImg = typeof payload.img === "string" ? payload.img.trim() : "";

    if (incomingImg && incomingImg !== currentUser.img) {
      const imageResult = await persistProfileImage(
        incomingImg,
        currentUser.imgPublicId || "",
      );
      payload.img = imageResult.img;
      payload.imgPublicId = imageResult.imgPublicId;
    }

    const updatedUser = await userModel.findByIdAndUpdate(id, payload, {
      new: true,
    });

    if (updatedUser) {
      res.status(200).json(updatedUser);
    } else {
      return res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const changeUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid ID" });
  }

  const allowedRoles = ["student", "admin", "instructor"];
  if (!role || !allowedRoles.includes(role)) {
    return res.status(400).json({ error: `Role must be one of: ${allowedRoles.join(", ")}` });
  }

  try {
    const user = await userModel.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  signupUser: signupUserV2,
  loginUser,
  getAllUsers,
  getSingleUser,
  deleteUser,
  updateUser: updateUserV2,
  makeAdmin,
  undoAdmin,
  forgetPassword,
  resetPassword,
  getAllUsersCount,
  changePassword,
  googleLogin: googleLoginV2,
  deleteMyAccount,
  updateLanguagePreference,
  changeUserRole,
};
