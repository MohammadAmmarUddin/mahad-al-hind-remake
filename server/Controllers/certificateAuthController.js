const Certificate = require("../Models/certificateAuthModel");
// Create Certificate

exports.createCertificate = async (req, res) => {
  const { certificateId, studentName, courseName, issueDate, valid } = req.body;

  if (!certificateId || !studentName || !courseName || !issueDate) {
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
// Get All Certificates
exports.getAllCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find().sort({ createdAt: -1 });
    res.status(200).json(certificates);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching certificates", error: error.message });
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
