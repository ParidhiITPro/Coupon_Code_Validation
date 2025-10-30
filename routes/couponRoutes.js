const express = require("express");
const router = express.Router();

const {
  createCoupon,
  getAllCoupons,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
} = require("../controllers/couponController");

const { createCouponSchema, updateCouponSchema } = require('../validation/couponValidation')
const validateRequest = require('../middleware/validateRequest')

router.post("/", validateRequest(createCouponSchema), createCoupon);
router.get("/", validateRequest(updateCouponSchema), getAllCoupons);
router.put("/:id", updateCoupon);
router.delete("/:id", deleteCoupon);
router.post("/validate", validateCoupon);

module.exports = router;
