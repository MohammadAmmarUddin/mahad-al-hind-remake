const express = require("express");
const {
  createCertificate,
  getAllCertificates,
  getCertificateById,
  checkCertificate,
  updateCertificate,
  deleteCertificate,
} = require("../Controllers/certificateAuthController");

const router = express.Router();

router.post("/createCertificate", createCertificate);

router.get("/", getAllCertificates);

router.get("/check/:certificateId", checkCertificate);

router.get("/:id", getCertificateById);

router.put("/:id", updateCertificate);

router.delete("/:id", deleteCertificate);

module.exports = router;
