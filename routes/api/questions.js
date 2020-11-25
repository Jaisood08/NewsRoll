const express = require("express");
const router = express.Router();

router.get("/", (req, res) => res.json({ questions: "questions is success" }));

module.exports = router;
