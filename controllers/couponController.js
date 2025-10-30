const Coupon = require("../models/Coupon");
const nodemailer = require("nodemailer");


const updateStatus = (coupon) => {
  const now = new Date();
  if (now < coupon.StartDate) coupon.Status = "Upcoming";
  else if (now > coupon.EndDate) coupon.Status = "Expired";
  else coupon.Status = "Active";
};


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});


const createCoupon = async (req, res) => {
  try {
    const { CouponCode } = req.body;
    console.log("[CREATE] Incoming create request:", req.body);

    
    const existing = await Coupon.findOne({ CouponCode });
    if (existing) {
      console.warn(`[CREATE] Duplicate CouponCode detected: ${CouponCode}`);
      return res.status(409).json({
        status: false,
        message: `Coupon code "${CouponCode}" already exists`,
      });
    }

    
    const coupon = new Coupon(req.body);
    updateStatus(coupon);
    await coupon.save();

    console.log(`[CREATE] Coupon created successfully: ${coupon.CouponCode}`);

    res.status(201).json({
      status: true,
      message: "Coupon created successfully",
      data: {
        OfferName: coupon.OfferName,
        CouponCode: coupon.CouponCode,
        StartDate: coupon.StartDate,
        EndDate: coupon.EndDate,
        DiscountPercentage: coupon.DiscountPercentage,
        DiscountAmount: coupon.DiscountAmount,
        Status: coupon.Status,
      },
    });

    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: req.body.userEmail,
      subject: `New Coupon Created: ${coupon.OfferName}`,
      text: `Your coupon "${coupon.CouponCode}" is now active!\nValid from ${coupon.StartDate.toDateString()} to ${coupon.EndDate.toDateString()}.`,
    };

    transporter
      .sendMail(mailOptions)
      .then(() =>
        console.log(`[MAIL] Email sent successfully to ${req.body.userEmail}`)
      )
      .catch((err) =>
        console.error("[MAIL] Failed to send email:", err.message)
      );
  } catch (err) {
    console.error("[CREATE] Error creating coupon:", err.message);
    res.status(500).json({
      status: false,
      message: "Server Error while creating coupon",
      error: err.message,
    });
  }
};



const getAllCoupons = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const coupons = await Coupon.find({}, "-__v").skip(skip).limit(limit);

    coupons.forEach(updateStatus);

    console.log(
      `[GET] Fetched ${coupons.length} coupons (Page: ${page}, Limit: ${limit})`
    );

    res.json({
      page,
      limit,
      count: coupons.length,
      coupons,
    });
  } catch (err) {
    console.error("[GET] Error fetching coupons:", err.message);
    res
      .status(500)
      .json({ message: "Failed to fetch coupons", error: err.message });
  }
};


const updateCoupon = async (req, res) => {
  try {
    console.log(`[UPDATE] Updating coupon ID: ${req.params.id}`);

    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!coupon) {
      console.warn(`[UPDATE] Coupon not found: ${req.params.id}`);
      return res.status(404).json({ message: "Coupon not found" });
    }

    updateStatus(coupon);
    await coupon.save();

    console.log(`[UPDATE] Coupon updated: ${coupon.CouponCode}`);
    res.json({ message: "Coupon updated successfully", coupon });
  } catch (err) {
    console.error("[UPDATE] Error updating coupon:", err.message);
    res
      .status(500)
      .json({ message: "Failed to update coupon", error: err.message });
  }
};


const deleteCoupon = async (req, res) => {
  try {
    console.log(`[DELETE] Deleting coupon ID: ${req.params.id}`);
    const deleted = await Coupon.findByIdAndDelete(req.params.id);

    if (!deleted) {
      console.warn(`[DELETE] Coupon not found: ${req.params.id}`);
      return res.status(404).json({ message: "Coupon not found" });
    }

    console.log(`[DELETE] Coupon deleted: ${deleted.CouponCode}`);
    res.json({ message: "Coupon deleted successfully" });
  } catch (err) {
    console.error("[DELETE] Error deleting coupon:", err.message);
    res
      .status(500)
      .json({ message: "Failed to delete coupon", error: err.message });
  }
};


const validateCoupon = async (req, res) => {
  try {
    const { CouponCode } = req.body;
    console.log(`[VALIDATE] Validating coupon: ${CouponCode}`);

    const coupon = await Coupon.findOne({ CouponCode });
    if (!coupon) {
      console.warn(`[VALIDATE] Coupon not found: ${CouponCode}`);
      return res.status(404).json({ valid: false, message: "Coupon not found" });
    }

    updateStatus(coupon);

    if (coupon.Status === "Expired") {
      console.log(`[VALIDATE] Coupon expired: ${CouponCode}`);
      return res.json({ valid: false, message: "Coupon expired" });
    }

    if (coupon.Status === "Upcoming") {
      console.log(`[VALIDATE] Coupon not active yet: ${CouponCode}`);
      return res.json({ valid: false, message: "Coupon not active yet" });
    }

    console.log(`[VALIDATE] Coupon valid: ${CouponCode}`);
    res.json({
      valid: true,
      message: "Coupon is valid",
      discount: coupon.DiscountPercentage || coupon.DiscountAmount,
    });
  } catch (err) {
    console.error("[VALIDATE] Error validating coupon:", err.message);
    res
      .status(500)
      .json({ message: "Error validating coupon", error: err.message });
  }
};

module.exports = {
  createCoupon,
  getAllCoupons,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
};
