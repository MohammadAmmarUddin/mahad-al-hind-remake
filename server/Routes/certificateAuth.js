const express = require("express");
const {
  createCertificate,
  getAllCertificates,
  getCertificateById,
  checkCertificate,
  deleteCertificate,
} = require("../Controllers/certificateAuthController");

const router = express.Router();

router.post("/createCertificate", createCertificate);

router.get("/", getAllCertificates);

router.get("/:id", getCertificateById);

router.get("/check/:certificateId", checkCertificate);

router.delete("/:id", deleteCertificate);

module.exports = router;
