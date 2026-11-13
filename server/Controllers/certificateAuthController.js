const Certificate = require("../Models/certificateAuthModel");
// Create Certificate

exports.createCertificate = async (req, res) => {
  const { certificateId, studentName, courseName, dob, address, issueDate, valid } = req.body;

  if (!certificateId || !studentName || !courseName || !dob || !address || !issueDate) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const existingCertificate = await Certificate.findOne({ certificateId });

    if (existingCertificate) {
      return res.status(200).json({
        exists: true,
        message: "Certificate already exists",
        certificate: existingCertificate,
      });
    }

    const newCertificate = new Certificate({
      certificateId,
      studentName,
      courseName,
      dob,
      address,
      issueDate,
      valid,
    });

    await newCertificate.save();

    res.status(200).json({
      exists: false,
      message: "Certificate created successfully",
      certificate: newCertificate,
    });
  } catch (error) {
    console.error("Error creating certificate:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// Get All Certificates (server-side search + pagination)
const escapeRegex = (str) => String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

exports.getAllCertificates = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

    const term = String(search).trim();
    const query = term
      ? {
          $or: [
            { certificateId: new RegExp(escapeRegex(term), "i") },
            { studentName: new RegExp(escapeRegex(term), "i") },
            { courseName: new RegExp(escapeRegex(term), "i") },
            { address: new RegExp(escapeRegex(term), "i") },
          ],
        }
      : {};

    const [certificates, total] = await Promise.all([
      Certificate.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .select("-__v")
        .lean(),
      Certificate.countDocuments(query),
    ]);

    res.status(200).json({
      certificates,
      total,
      page: pageNum,
      pages: Math.max(1, Math.ceil(total / limitNum)),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching certificates", error: error.message });
  }
};

// Update Certificate
exports.updateCertificate = async (req, res) => {
  const { id } = req.params;
  const { certificateId, studentName, courseName, dob, address, issueDate, valid } = req.body;

  if (!certificateId || !studentName || !courseName || !dob || !address || !issueDate) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const duplicate = await Certificate.findOne({
      certificateId,
      _id: { $ne: id },
    });
    if (duplicate) {
      return res.status(409).json({ message: "Certificate ID already in use." });
    }

    const updated = await Certificate.findByIdAndUpdate(
      id,
      {
        certificateId: certificateId.trim(),
        studentName,
        courseName,
        dob,
        address,
        issueDate,
        ...(valid !== undefined ? { valid } : {}),
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    res.status(200).json({
      message: "Certificate updated successfully",
      certificate: updated,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get Single Certificate by ID (MongoDB _id)
exports.getCertificateById = async (req, res) => {
  const { id } = req.params;

  try {
    const certificate = await Certificate.findById(id);
    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }
    res.status(200).json(certificate);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching certificate", error: error.message });
  }
};

// Check Certificate by Certificate ID (Custom ID)
exports.checkCertificate = async (req, res) => {
  const { certificateId } = req.params;

  try {
    const certificate = await Certificate.findOne({ certificateId });

    if (!certificate) {
      return res
        .status(404)
        .json({ valid: false, message: "Certificate not found" });
    }

    res.status(200).json({ valid: certificate.valid, certificate });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error checking certificate", error: error.message });
  }
};

// Delete Certificate
exports.deleteCertificate = async (req, res) => {
  const { id } = req.params;

  try {
    const certificate = await Certificate.findByIdAndDelete(id);
    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }
    res.status(200).json({ message: "Certificate deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting certificate", error: error.message });
  }
};
