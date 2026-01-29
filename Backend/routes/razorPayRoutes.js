const express = require("express");
const router = express.Router();
const RazorPayController = require("../controller/razorPayController");

router.post("/createorder", RazorPayController.createOrder);

module.exports = router;
