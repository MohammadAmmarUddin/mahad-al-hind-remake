const mongoose = require("mongoose");
const courseModel = require("../Models/courseModel.js");
const userModel = require("../Models/userModel.js");
const Certificate = require("../Models/certificateAuthModel.js");
const SSLCommerzPayment = require("sslcommerz-lts");
const { destroyCloudinaryAsset } = require("../Utils/cloudinary");
const { createNotification } = require("../Controllers/notificationController");

const createCourse = async (req, res) => {
  const {
    userId,
    title,
    magnetLine,
    details,
    requirements,
    instructorsId,
    whatsappGroupLink,
    banner,
    bannerPublicId,
    videos,
    quizzes, // Changed from 'quiz' to 'quizzes' to match frontend
    category,
    subCategory,
    syllabus,
    syllabusPublicId,
    keywords,
    price,
    discount,
    studentsId,
    studentsOpinion,
  } = req.body;

  try {
    const newCourse = new courseModel({
      userId,
      title,
      magnetLine,
      details,
      requirements,
      instructorsId,
      whatsappGroupLink,
      banner,
      bannerPublicId,
      videos,
      quiz: quizzes.map((q) => ({
        // Transform incoming quizzes to match schema
        ques: q.question,
        options: q.options,
        ans: parseInt(q.answer),
      })),
      category,
      subCategory,
      syllabus,
      syllabusPublicId,
      keywords,
      price,
      discount,
      students: studentsId ? studentsId.map((id) => ({ studentsId: id })) : [], // Initialize students array if provided
      studentsOpinion,
    });

    const savedCourse = await newCourse.save();
    res.status(201).json(savedCourse);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllCourses = async (req, res) => {
  try {
    const courses = await courseModel.find({});
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSingleCourse = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid ID" });
  }

  try {
    const course = await courseModel.findById(id);
    if (course) {
      res.status(200).json(course);
    } else {
      return res.status(404).json({ error: "Course not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllEnrolledCourse = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "User ID is required." });
    }

    // Find courses where the user is enrolled
    const enrolledCourses = await courseModel
      .find({
        "students.studentsId": id,
      })
      .select("title category subCategory banner students videos");

    if (!enrolledCourses.length) {
      return res
        .status(404)
        .json({ message: "No enrolled courses found for this user." });
    }

    res.status(200).json({
      message: "Enrolled courses retrieved successfully.",
      courses: enrolledCourses,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching courses." });
  }
};

const getReletedCourses = async (req, res) => {
  const { id } = req.params; // Expecting the course ID as a parameter
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid ID" });
  }

  try {
    // Retrieve the current course using its ID
    const course = await courseModel.findById(id);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    const keywords = course.keywords; // Get keywords from the retrieved course

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return res
        .status(400)
        .json({ error: "No keywords available for this course" });
    }

    // Find courses that have at least one matching keyword
    const relatedCourses = await courseModel.find({
      _id: { $ne: id }, // Exclude the current course from the results
      keywords: { $in: keywords },
    });

    res.status(200).json(relatedCourses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateCourse = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid ID" });
  }

  try {
    const currentCourse = await courseModel.findById(id);
    if (!currentCourse) {
      return res.status(404).json({ error: "Course not found" });
    }

    const updatedPayload = { ...req.body };
    const cleanupTasks = [];

    if (
      updatedPayload.bannerPublicId &&
      currentCourse.bannerPublicId &&
      updatedPayload.bannerPublicId !== currentCourse.bannerPublicId
    ) {
      cleanupTasks.push(
        destroyCloudinaryAsset(currentCourse.bannerPublicId, "image").catch((error) => {
          console.warn("Failed to delete replaced banner:", error.message);
        }),
      );
    }

    if (
      updatedPayload.syllabusPublicId &&
      currentCourse.syllabusPublicId &&
      updatedPayload.syllabusPublicId !== currentCourse.syllabusPublicId
    ) {
      cleanupTasks.push(
        destroyCloudinaryAsset(currentCourse.syllabusPublicId, "raw").catch((error) => {
          console.warn("Failed to delete replaced syllabus:", error.message);
        }),
      );
    }

    if (Array.isArray(updatedPayload.videos) && Array.isArray(currentCourse.videos)) {
      const incomingPublicIds = new Set(
        updatedPayload.videos.map((video) => video?.publicId).filter(Boolean),
      );

      currentCourse.videos.forEach((video) => {
        if (video?.publicId && !incomingPublicIds.has(video.publicId)) {
          cleanupTasks.push(
            destroyCloudinaryAsset(video.publicId, video.resourceType || "video").catch(
              (error) => {
                console.warn("Failed to delete replaced video:", error.message);
              },
            ),
          );
        }
      });
    }

    await Promise.allSettled(cleanupTasks);

    const updatedCourse = await courseModel.findByIdAndUpdate(id, updatedPayload, {
      new: true,
    });
    if (updatedCourse) {
      res.status(200).json(updatedCourse);
    } else {
      return res.status(404).json({ error: "Course not found" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteCourse = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid ID" });
  }

  try {
    const course = await courseModel.findById(id);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    const cleanupTasks = [];

    if (course.bannerPublicId) {
      cleanupTasks.push(
        destroyCloudinaryAsset(course.bannerPublicId, "image").catch((error) => {
          console.warn("Failed to delete course banner:", error.message);
        }),
      );
    }

    if (course.syllabusPublicId) {
      cleanupTasks.push(
        destroyCloudinaryAsset(course.syllabusPublicId, "raw").catch((error) => {
          console.warn("Failed to delete course syllabus:", error.message);
        }),
      );
    }

    if (Array.isArray(course.videos)) {
      course.videos.forEach((video) => {
        if (video?.publicId) {
          cleanupTasks.push(
            destroyCloudinaryAsset(video.publicId, video.resourceType || "video").catch(
              (error) => {
                console.warn("Failed to delete course video:", error.message);
              },
            ),
          );
        }
      });
    }

    await Promise.allSettled(cleanupTasks);
    const deletedCourse = await courseModel.findByIdAndDelete(id);
    if (deletedCourse) {
      res
        .status(200)
        .json({ message: "Course deleted successfully", deletedCourse });
    } else {
      return res.status(404).json({ error: "Course not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const giveRating = async (req, res) => {
  const { courseId } = req.params;
  const { reviewerId, rating, comments } = req.body;
  try {
    const course = await courseModel.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    const existingReview = course.studentsOpinion.find(
      (opinion) => opinion.reviewerId.toString() === reviewerId
    );
    if (existingReview) {
      // If a review already exists, return an error message
      return res
        .status(400)
        .json({ message: "An user cannot give multiple reviews" });
    } else {
      // Add a new review if none exists
      course.studentsOpinion.push({
        reviewerId,
        rating,
        comments,
      });
    }
    await course.save();
    res.status(200).json({ message: "Rating submitted successfully", course });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const courseCount = async (req, res) => {
  const courseCount = await courseModel.estimatedDocumentCount();
  res.send({ courseCount });
};
const store_id = "testi670bf7e308353";
const store_passwd = "testi670bf7e308353@ssl";
const is_live = false; //true for live, false for sandbox

const PaymentSession = mongoose.model(
  "PaymentSession",
  new mongoose.Schema(
    {
      tranId: { type: String, required: true },
      courseId: { type: mongoose.Schema.Types.ObjectId, ref: "courseCollection", required: true },
      studentsId: { type: mongoose.Schema.Types.ObjectId, ref: "userCollection", required: true },
      payment: { type: String, required: true },
      paymentComplete: { type: Boolean, default: false },
      paymentMethod: { type: String, enum: ["SSLCommerz", "bKash", "Nagad", "GooglePay", "PhonePe", "manual"], default: "SSLCommerz" },
      paymentNumber: { type: String, default: "" },
      manualTransactionId: { type: String, default: "" },
      status: { type: String, enum: ["pending", "approved", "rejected", "completed"], default: "completed" },
      notes: { type: String, default: "" },
    },
    { timestamps: true }
  )
);

const getAllTransactions = async (req, res) => {
  try {
    const courses = await PaymentSession.find({});
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const order = async (req, res) => {
  const tran_id = new mongoose.Types.ObjectId().toString();

  // Create the payment session data but don't save it yet
  const paymentData = {
    courseId: req.body.courseId,
    studentsId: req.body.studentsId,
    payment: req.body.price,
  };

  // Encode the payment data to pass through URL
  const encodedData = Buffer.from(JSON.stringify(paymentData)).toString(
    "base64"
  );

  const data = {
    total_amount: req.body.price,
    currency: "BDT",
    tran_id: tran_id,
    success_url: `${process.env.BASE_URL}/api/course/payment/success/${tran_id}/${encodedData}`,
    fail_url: `${process.env.BASE_URL}/api/course/payment/fail/${req.body.courseId}`,
    cancel_url: `${process.env.BASE_URL}/cancel`,
    ipn_url: `${process.env.BASE_URL}/ipn`,
    shipping_method: "Courier",
    product_name: "Computer.",
    product_category: "Electronic",
    product_profile: "general",
    cus_name: "Customer Name",
    cus_email: "customer@example.com",
    cus_add1: "Dhaka",
    cus_add2: "Dhaka",
    cus_city: "Dhaka",
    cus_state: "Dhaka",
    cus_postcode: "1000",
    cus_country: "Bangladesh",
    cus_phone: "01711111111",
    cus_fax: "01711111111",
    ship_name: "Customer Name",
    ship_add1: "Dhaka",
    ship_add2: "Dhaka",
    ship_city: "Dhaka",
    ship_state: "Dhaka",
    ship_postcode: 1000,
    ship_country: "Bangladesh",
  };

  const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
  sslcz.init(data).then((apiResponse) => {
    let GatewayPageURL = apiResponse.GatewayPageURL;
    res.send({ url: GatewayPageURL });
  });
};

const success = async (req, res) => {
  try {
    const { tran_id, encodedData } = req.params;

    // Decode the payment data from URL
    const paymentData = JSON.parse(
      Buffer.from(encodedData, "base64").toString()
    );

    // Now save the payment session since payment was successful
    const paymentSession = new PaymentSession({
      tranId: tran_id,
      courseId: paymentData.courseId,
      studentsId: paymentData.studentsId,
      payment: paymentData.payment,
    });

    await paymentSession.save();

    const courseId = paymentData.courseId.toString();
    const studentsId = paymentData.studentsId.toString();

    // Update the course document in the students array
    const course = await courseModel.findOneAndUpdate(
      {
        _id: courseId,
        "students.studentsId": studentsId,
      },
      {
        $set: {
          "students.$.paymentComplete": true,
          "students.$.paymentId": tran_id,
        },
      },
      { new: true }
    );

    if (!course) {
      await courseModel.findByIdAndUpdate(courseId, {
        $push: {
          students: {
            studentsId: studentsId,
            paymentId: tran_id,
            paymentComplete: true,
          },
        },
      });
    }

    res.redirect(`${process.env.BASE_URL}/singleCourse/${courseId}`);
  } catch (err) {
    console.error("Error in success handler:", err);
    res.status(500).json({
      message: "An error occurred while updating the payment information.",
    });
  }
};

const fail = async (req, res) => {
  const { courseId } = req.params;
  console.log("🚀 ~ fail ~ courseId:", courseId);
  res.redirect(`${process.env.BASE_URL}/singleCourse/${courseId}`);
};

const manualEnroll = async (req, res) => {
  try {
    const { courseId, studentsId, payment, paymentMethod, paymentNumber, transactionId, notes } = req.body;

    if (!courseId || !studentsId || !payment) {
      return res.status(400).json({ message: "courseId, studentsId, and payment are required." });
    }

    const course = await courseModel.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    const alreadyEnrolled = course.students.find(
      (s) => s.studentsId.toString() === studentsId
    );
    if (alreadyEnrolled) {
      return res.status(400).json({ message: "Already enrolled in this course." });
    }

    const tranId = new mongoose.Types.ObjectId().toString();

    const paymentSession = new PaymentSession({
      tranId,
      courseId,
      studentsId,
      payment: String(payment),
      paymentComplete: false,
      paymentMethod: paymentMethod || "manual",
      paymentNumber: paymentNumber || "",
      manualTransactionId: transactionId || "",
      status: "pending",
      notes: notes || "",
    });

    await paymentSession.save();

    course.students.push({
      studentsId,
      paymentId: tranId,
      paymentComplete: false,
    });

    await course.save();

    const studentUser = await userModel.findById(studentsId);
    createNotification({
      role: "admin",
      type: "enrollment_request",
      message: `${studentUser?.firstname || "A student"} ${studentUser?.lastname || ""} requested enrollment in "${course.title}"`,
      link: "/dashboard/admin/allTransactions",
      relatedId: String(paymentSession._id),
    });

    res.status(201).json({
      message: "Enrollment request submitted. Awaiting admin approval.",
      transaction: paymentSession,
    });
  } catch (error) {
    console.error("Manual enroll error:", error);
    res.status(500).json({ message: "Failed to submit enrollment request." });
  }
};

const approveEnrollment = async (req, res) => {
  try {
    const { tranId } = req.params;

    const session = await PaymentSession.findOne({ tranId });
    if (!session) {
      return res.status(404).json({ message: "Transaction not found." });
    }

    if (session.status !== "pending") {
      return res.status(400).json({ message: `Enrollment is already ${session.status}.` });
    }

    session.status = "approved";
    session.paymentComplete = true;
    await session.save();

    const courseId = session.courseId.toString();
    const studentsId = session.studentsId.toString();

    await courseModel.findOneAndUpdate(
      { _id: courseId, "students.studentsId": studentsId },
      { $set: { "students.$.paymentComplete": true } },
    );

    createNotification({
      userId: session.studentsId,
      type: "enrollment_approved",
      message: session.courseTitle
        ? `Your enrollment in "${session.courseTitle}" has been approved.`
        : "Your enrollment request has been approved.",
      link: `/singleCourse/${courseId}`,
      relatedId: String(session._id),
    });

    res.status(200).json({ message: "Enrollment approved.", transaction: session });
  } catch (error) {
    console.error("Approve enrollment error:", error);
    res.status(500).json({ message: "Failed to approve enrollment." });
  }
};

const rejectEnrollment = async (req, res) => {
  try {
    const { tranId } = req.params;

    const session = await PaymentSession.findOne({ tranId });
    if (!session) {
      return res.status(404).json({ message: "Transaction not found." });
    }

    if (session.status !== "pending") {
      return res.status(400).json({ message: `Enrollment is already ${session.status}.` });
    }

    session.status = "rejected";
    await session.save();

    const courseId = session.courseId.toString();
    const studentsId = session.studentsId.toString();

    await courseModel.findByIdAndUpdate(courseId, {
      $pull: { students: { studentsId } },
    });

    createNotification({
      userId: session.studentsId,
      type: "enrollment_rejected",
      message: "Your enrollment request has been rejected. Please contact support for more details.",
      link: "",
      relatedId: String(session._id),
    });

    res.status(200).json({ message: "Enrollment rejected.", transaction: session });
  } catch (error) {
    console.error("Reject enrollment error:", error);
    res.status(500).json({ message: "Failed to reject enrollment." });
  }
};

const getPendingEnrollments = async (req, res) => {
  try {
    const sessions = await PaymentSession.find({ status: "pending" })
      .populate("courseId", "title price")
      .populate("studentsId", "firstname lastname email phone")
      .sort({ createdAt: -1 });

    res.status(200).json(sessions);
  } catch (error) {
    console.error("Get pending enrollments error:", error);
    res.status(500).json({ message: "Failed to fetch pending enrollments." });
  }
};

const getAllEnrollments = async (req, res) => {
  try {
    const sessions = await PaymentSession.find({})
      .populate("courseId", "title price")
      .populate("studentsId", "firstname lastname email phone")
      .sort({ createdAt: -1 });

    res.status(200).json(sessions);
  } catch (error) {
    console.error("Get all enrollments error:", error);
    res.status(500).json({ message: "Failed to fetch enrollments." });
  }
};

const topCourses = async (req, res) => {
  try {
    // Use MongoDB aggregation to calculate average ratings and fetch top 6 courses
    const topCourses = await courseModel.aggregate([
      // Unwind the studentsOpinion array to work on individual ratings
      { $unwind: "$studentsOpinion" },

      // Convert the rating field to a number (if stored as string)
      {
        $addFields: {
          "studentsOpinion.rating": { $toDouble: "$studentsOpinion.rating" },
        },
      },

      // Group by course and calculate the average rating
      {
        $group: {
          _id: "$_id",
          title: { $first: "$title" },
          banner: { $first: "$banner" },
          details: { $first: "$details" },
          averageRating: { $avg: "$studentsOpinion.rating" },
        },
      },

      // Sort courses by average rating in descending order
      { $sort: { averageRating: -1 } },

      // Limit the result to top 6 courses
      { $limit: 6 },
    ]);

    res.status(200).json({
      success: true,
      data: topCourses,
    });
  } catch (error) {
    console.error("Error fetching top courses:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch top courses",
    });
  }
};

const unlockVideo = async (req, res) => {
  // Log the incoming request data for debugging
  console.log("Request body:", req.body);
  console.log("Request params:", req.params);

  const courseId = req.body._id;
  const studentId = req.params.id; // Changed from req.params.studentId to req.params.id

  console.log("Parsed IDs:", { courseId, studentId });

  // Validate ObjectId format
  if (
    !mongoose.Types.ObjectId.isValid(courseId) ||
    !mongoose.Types.ObjectId.isValid(studentId)
  ) {
    return res.status(400).json({
      error: "Invalid courseId or studentId",
      receivedCourseId: courseId,
      receivedStudentId: studentId,
    });
  }

  try {
    // Find the course
    const course = await courseModel.findById(courseId);

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Find the specific student in the course's students array
    const student = course.students.find(
      (s) => s.studentsId.toString() === studentId
    );

    if (!student) {
      return res.status(404).json({ error: "Student not found in course" });
    }

    // Check if unlockedVideo has reached the videos length
    if (student.unlockedVideo >= course.videos.length) {
      return res.status(400).json({
        error: "All videos are already unlocked for this student",
      });
    }

    // Increment unlockedVideo
    const updatedCourse = await courseModel.findOneAndUpdate(
      {
        _id: courseId,
        "students.studentsId": studentId,
      },
      {
        $inc: { "students.$.unlockedVideo": 1 },
      },
      { new: true }
    );

    res.status(200).json({
      message: "Unlocked video incremented successfully",
      updatedCourse,
    });
  } catch (error) {
    console.error("Error in unlockVideo:", error);
    res.status(500).json({ error: error.message });
  }
};

const generateCertificateId = async () => {
  const year = new Date().getFullYear();
  const count = await Certificate.countDocuments({
    issueDate: { $gte: new Date(`${year}-01-01`), $lt: new Date(`${year + 1}-01-01`) },
  });
  const seq = String(count + 1).padStart(5, "0");
  return `CERT-MAHAD-${year}-${seq}`;
};

const completeCourse = async (req, res) => {
  const courseId = req.body._id;
  const studentId = req.params.id;

  if (
    !mongoose.Types.ObjectId.isValid(courseId) ||
    !mongoose.Types.ObjectId.isValid(studentId)
  ) {
    return res.status(400).json({ error: "Invalid courseId or studentId" });
  }

  try {
    const course = await courseModel.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    const student = course.students.find(
      (s) => s.studentsId.toString() === studentId
    );
    if (!student) {
      return res.status(404).json({ error: "Student not found in course" });
    }

    if (student.isCourseComplete) {
      return res.status(400).json({
        error: "Course is already marked as complete for this student",
      });
    }

    const studentUser = await userModel.findById(studentId);
    const studentName = studentUser
      ? `${studentUser.firstname} ${studentUser.lastname}`
      : "Student";

    const certificateId = await generateCertificateId();

    const certificate = new Certificate({
      certificateId,
      studentName,
      courseName: course.title || "Course",
      issueDate: new Date(),
      valid: true,
    });
    await certificate.save();

    const updatedCourse = await courseModel.findOneAndUpdate(
      {
        _id: courseId,
        "students.studentsId": studentId,
      },
      {
        $set: {
          "students.$.isCourseComplete": true,
          "students.$.certificateUrl": certificateId,
        },
      },
      { new: true }
    );

    createNotification({
      userId: studentId,
      type: "course_completed",
      message: `Congratulations! You have completed "${course.title}". View your certificate.`,
      link: `/certificate?certId=${certificateId}`,
      relatedId: certificateId,
    });

    createNotification({
      role: "admin",
      type: "course_completed",
      message: `${studentName} completed "${course.title}".`,
      link: "",
      relatedId: certificateId,
    });

    res.status(200).json({
      message: "Course completed successfully",
      certificateId,
      certificate,
    });
  } catch (error) {
    console.error("Error in completeCourse:", error);
    res.status(500).json({ error: error.message });
  }
};

const completeQuiz = async (req, res) => {
  // Log the incoming request data for debugging
  console.log("Request body:", req.body);
  console.log("Request params:", req.params);

  const courseId = req.body._id;
  const studentId = req.params.id;

  console.log("Parsed IDs:", { courseId, studentId });

  // Validate ObjectId format
  if (
    !mongoose.Types.ObjectId.isValid(courseId) ||
    !mongoose.Types.ObjectId.isValid(studentId)
  ) {
    return res.status(400).json({
      error: "Invalid courseId or studentId",
      receivedCourseId: courseId,
      receivedStudentId: studentId,
    });
  }

  try {
    // Find the course
    const course = await courseModel.findById(courseId);

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Find the specific student in the course's students array
    const student = course.students.find(
      (s) => s.studentsId.toString() === studentId
    );

    if (!student) {
      return res.status(404).json({ error: "Student not found in course" });
    }

    // Check if course is already completed
    // if (student.isQuizComplete) {
    //   return res.status(400).json({
    //     error: "Quiz is already marked as complete for this student",
    //   });
    // }

    // Set isCourseComplete to true
    const updatedCourse = await courseModel.findOneAndUpdate(
      {
        _id: courseId,
        "students.studentsId": studentId,
      },
      {
        $set: {
          "students.$.isQuizComplete": true,
          "students.$.quizMarks": req.body.quizMarks,
          "students.$.quizMarksPercentage": req.body.quizMarksPercentage,
        },
      },
      { new: true }
    );

    res.status(200).json({
      message: "Quiz marked as complete successfully",
      updatedCourse,
    });
  } catch (error) {
    console.error("Error in complete quiz:", error);
    res.status(500).json({ error: error.message });
  }
};
const getEnrolledUsersCourses = async (req, res) => {
  try {
    // Aggregate query to count total enrolled students across all courses
    const result = await courseModel.aggregate([
      {
        $project: {
          enrolledStudentsCount: { $size: { $ifNull: ["$students", []] } }, // Count students in each course
        },
      },
      {
        $group: {
          _id: null, // Group all courses together
          totalEnrolledStudents: { $sum: "$enrolledStudentsCount" }, // Sum all student counts
        },
      },
    ]);

    // Extract the total count from the aggregation result
    const totalEnrolledStudents =
      result.length > 0 ? result[0].totalEnrolledStudents : 0;

    return res.status(200).json({
      totalEnrolledStudents,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
const getTotalRevenue = async (req, res) => {
  try {
    const result = await courseModel.aggregate([
      {
        $project: {
          price: { $toDouble: "$price" }, // Convert price to a number
          discount: {
            $toDouble: {
              $cond: {
                if: {
                  $or: [
                    { $eq: ["$discount", ""] },
                    { $eq: ["$discount", null] },
                  ],
                }, // Check for empty string or null
                then: 0, // Default to 0
                else: "$discount", // Use the actual discount value
              },
            },
          },
          students: { $ifNull: ["$students", []] }, // Ensure students is always an array
        },
      },
      {
        $addFields: {
          effectivePrice: { $subtract: ["$price", "$discount"] }, // Subtract discount from price
        },
      },
      {
        $addFields: {
          paidStudents: {
            $filter: {
              input: "$students",
              as: "student",
              cond: { $eq: ["$$student.paymentComplete", true] }, // Filter for students with paymentComplete = true
            },
          },
        },
      },
      {
        $addFields: {
          revenue: {
            $multiply: [
              { $size: "$paidStudents" }, // Count of paid students
              { $max: ["$effectivePrice", 0] }, // Ensure no negative prices due to discounts
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$revenue" }, // Sum up revenue from all courses
        },
      },
    ]);

    const totalRevenue = result.length > 0 ? result[0].totalRevenue : 0;

    res.status(200).json({
      message: "Total revenue calculated successfully",
      totalRevenue,
    });
  } catch (error) {
    console.error("Error calculating total revenue:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getCourseCategories = async (req, res) => {
  try {
    // Fetching unique course categories with their count
    const categories = await courseModel.aggregate([
      {
        $group: {
          _id: "$category", // Group by category
          count: { $sum: 1 }, // Count the number of courses in each category
        },
      },
      {
        $project: {
          _id: 0, // Don't include the _id field
          name: "$_id", // Rename _id to name
          count: 1, // Include the count field
        },
      },
    ]);

    console.log("Categories fetched:", categories);

    // If no categories found, send empty array
    if (!categories || categories.length === 0) {
      return res.status(404).json({ message: "No categories found" });
    }

    // Return the list of categories with their counts
    res.status(200).json({
      categories: categories, // Categories with counts only
    });
  } catch (error) {
    console.error("Error fetching course categories:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
const getTotalAverageRating = async (req, res) => {
  try {
    // Aggregation pipeline to calculate the total average rating across all courses
    const totalAverageRating = await courseModel.aggregate([
      {
        $unwind: "$studentsOpinion", // Unwind the studentsOpinion array to access individual ratings
      },
      {
        $group: {
          _id: null, // Grouping all reviews into one group
          totalRating: { $sum: { $toDouble: "$studentsOpinion.rating" } }, // Sum all the ratings (convert from string to number)
          totalReviews: { $sum: 1 }, // Count the total number of reviews
        },
      },
      {
        $project: {
          _id: 0, // Don't include the _id field
          avgRating: {
            $round: [{ $divide: ["$totalRating", "$totalReviews"] }, 1],
          }, // Calculate the average rating
        },
      },
    ]);

    // If no ratings found, return a message indicating no reviews
    if (!totalAverageRating || totalAverageRating.length === 0) {
      return res.status(404).json({ message: "No reviews or ratings found" });
    }

    // Return the total average rating
    res.status(200).json({
      avgRating: totalAverageRating[0].avgRating, // Return the calculated average rating
    });
  } catch (error) {
    console.error("Error calculating total average rating:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getCompletedCoursesCount = async (req, res) => {
  try {
    // Aggregation pipeline to count the number of completed courses across all users
    const completedCoursesCount = await courseModel.aggregate([
      {
        $unwind: "$students",
      },
      {
        $match: {
          "students.isCourseComplete": true,
        },
      },
      {
        $group: {
          _id: "$_id", // Group by course ID
          completedStudentsCount: { $sum: 1 }, // Count the number of students who completed the course
        },
      },
      {
        $count: "totalCompletedCourses", // Count the total number of courses that have been completed
      },
    ]);

    // If no completed courses found, return a message indicating no completed courses
    if (!completedCoursesCount || completedCoursesCount.length === 0) {
      return res.status(404).json({ message: "No completed courses found" });
    }

    // Return the completed courses count
    res.status(200).json({
      totalCompletedCourses: completedCoursesCount[0].totalCompletedCourses, // Return the count of completed courses
    });
  } catch (error) {
    console.error("Error fetching completed courses count:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getAverageCompletionTime = async (req, res) => {
  try {
    // Find all courses with students who completed the course
    const courses = await courseModel.find(
      {
        "students.isCourseComplete": true,
      },
      {
        "students.$": 1, // Only fetch students array
      }
    );

    let totalCompletionTime = 0; // Total time taken by all students
    let completedCoursesCount = 0; // Number of students who completed courses

    courses.forEach((course) => {
      course.students.forEach((student) => {
        if (
          student.isCourseComplete &&
          student.startTime &&
          student.completionTime
        ) {
          const timeTaken =
            new Date(student.completionTime) - new Date(student.startTime);
          totalCompletionTime += timeTaken;
          completedCoursesCount++;
        }
      });
    });

    // Calculate the average completion time in milliseconds
    const averageCompletionTime =
      completedCoursesCount > 0
        ? totalCompletionTime / completedCoursesCount
        : 0;

    // Convert milliseconds to days
    const averageTimeInDays = Math.floor(
      averageCompletionTime / (1000 * 60 * 60 * 24)
    );

    res.status(200).json({
      message: "Average completion time retrieved successfully",
      averageCompletionTimeInDays: averageTimeInDays,
    });
  } catch (error) {
    console.error("Error calculating average completion time:", error);
    res
      .status(500)
      .json({ message: "Error calculating average completion time" });
  }
};

// Endpoint to calculate the sum of payments
const getTotalPayment = async (req, res) => {
  try {
    const result = await PaymentSession.aggregate([
      {
        $match: {
          payment: { $ne: null }, // Ensure the payment field is not null
        },
      },
      {
        $addFields: {
          paymentAsNumber: { $toDouble: "$payment" }, // Convert payment from string to number
        },
      },
      {
        $group: {
          _id: null,
          totalPayment: { $sum: "$paymentAsNumber" }, // Sum up the numeric payment values
        },
      },
    ]);

    const totalPayment = result.length > 0 ? result[0].totalPayment : 0;

    res.status(200).json({
      message: "Total payment calculated successfully",
      totalPayment,
    });
  } catch (error) {
    console.error("Error calculating total payment:", error);
    res.status(500).json({
      message: "Failed to calculate total payment",
      error: error.message,
    });
  }
};
const getTotalPaymentBySpecificStudent = async (req, res) => {
  try {
    // Get studentId from route params
    const { studentId } = req.params;

    // Check if studentId is provided
    if (!studentId) {
      return res.status(400).json({ message: "Student ID is required" });
    }

    console.log("Student ID:", studentId); // Log the student ID

    // Ensure the ObjectId conversion is correct
    const result = await PaymentSession.aggregate([
      {
        $match: {
          studentsId: new mongoose.Types.ObjectId(studentId), // Convert string ID to ObjectId
        },
      },
      {
        $addFields: {
          paymentAsNumber: {
            $toDouble: { $ifNull: ["$payment", 0] }, // Convert payment to number, default to 0 if null
          },
        },
      },
      {
        $group: {
          _id: "$studentsId",
          totalPayment: { $sum: "$paymentAsNumber" }, // Sum up the numeric payment values
        },
      },
    ]);

    // If no result found, set totalPayment to 0
    const totalPayment = result.length > 0 ? result[0].totalPayment : 0;

    res.status(200).json({
      message: `Total payment calculated successfully for student ID ${studentId}`,
      studentId,
      totalPayment,
    });
  } catch (error) {
    console.error(
      "Error calculating total payment for specific student:",
      error
    );
    res.status(500).json({
      message: "Failed to calculate total payment for the student",
      error: error.message,
    });
  }
};

const getUserCourseProgress = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Student ID is required." });
  }

  try {
    const courses = await courseModel.aggregate([
      // Match courses that contain the specified studentId in the students array
      {
        $match: {
          students: { $elemMatch: { studentsId: id } },
        },
      },
      // Unwind the students array to process each student separately
      { $unwind: "$students" },
      // Filter the students to include only the specified studentId
      {
        $match: {
          "students.studentsId": id,
        },
      },
      // Group by courseId and title, summing the unlockedVideos for the specified student
      {
        $group: {
          _id: { courseId: "$_id", title: "$title" },
          unlockedVideo: { $sum: "$students.unlockedVideo" },
        },
      },
      // Project the desired fields in the output
      {
        $project: {
          _id: 0,
          courseId: "$_id.courseId",
          title: "$_id.title",
          unlockedVideo: 1,
        },
      },
    ]);

    if (courses.length === 0) {
      return res
        .status(404)
        .json({ message: "No courses found for the specified student." });
    }

    res.status(200).json(courses);
  } catch (error) {
    console.error("Error fetching courses progress:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching courses progress." });
  }
};

const getVideosCount = async (req, res) => {
  try {
    const { id } = req.params; // Extract studentId from the request body

    if (!id) {
      return res.status(400).send({ error: "Student ID is required" });
    }

    const result = await courseModel.aggregate([
      // Filter courses where the student is enrolled
      {
        $match: {
          students: id, // Match courses where studentId exists in the students array
        },
      },
      // Project the number of videos in each course
      {
        $project: {
          numberOfVideos: { $size: "$videos" },
        },
      },
      // Group to sum up the total videos
      {
        $group: {
          _id: null,
          totalVideos: { $sum: "$numberOfVideos" },
        },
      },
    ]);

    // Get the total videos count or return 0 if no courses found
    const totalVideos = result.length > 0 ? result[0].totalVideos : 0;

    res.send({ totalVideos });
  } catch (error) {
    console.error("Error fetching total videos count:", error);
    res.status(500).send({
      error: "An error occurred while fetching the total videos count.",
    });
  }
};

module.exports = {
  createCourse,
  getAllCourses,
  getSingleCourse,
  getAllEnrolledCourse,
  getReletedCourses,
  updateCourse,
  deleteCourse,
  giveRating,
  courseCount,
  getAllTransactions,
  order,
  success,
  fail,
  manualEnroll,
  approveEnrollment,
  rejectEnrollment,
  getPendingEnrollments,
  getAllEnrollments,
  topCourses,
  unlockVideo,
  completeCourse,
  completeQuiz,
  getEnrolledUsersCourses,
  getTotalRevenue,
  getCourseCategories,
  getTotalAverageRating,
  getCompletedCoursesCount,
  getAverageCompletionTime,
  getTotalPayment,
  getTotalPaymentBySpecificStudent,
  getUserCourseProgress,
  getVideosCount,
};
