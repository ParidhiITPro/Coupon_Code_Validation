const Joi = require('joi')

const createCouponSchema = Joi.object({
    OfferName: Joi.string().required().messages({
        "string.empty": "Offer Name is required",
    }),

    CouponCode: Joi.string().alphanum().min(3).max(20).required().messages({
        "string.empty": "Coupon Code is required",
    }),

    StartDate: Joi.date().required().messages({
        "any.required": "Start Date is required",
    }),

    EndDate: Joi.date().greater(Joi.ref("StartDate")).required().messages({
        "any.required": "End Date is required",
        "date.greater": "End Date must be after Start Date",
    }),

    DiscountPercentage: Joi.number().min(0).max(100).default(0).messages({
        "number.base": "Discount Percentage must be a number",
        "number.min": "Discount Percentage cannont be below 0",
        "number.max": "Discount Percentage cannot exceed 100",
    }),

    DiscountAmount: Joi.number().min(0).default(0),

    TermsAndCondition: Joi.string().allow(""),

    Status: Joi.string().valid("Actice", "Expired", "Upcoming").default("Active"),

    userEmail: Joi.string().email().required().messages({
        "string.email": "A valid email address is required",
        "any.required": "User email is required",
    }),

})

const updateCouponSchema = Joi.object({
  OfferName: Joi.string().optional(),
  CouponCode: Joi.string().alphanum().min(3).max(20).optional(),
  StartDate: Joi.date().optional(),
  EndDate: Joi.date().greater(Joi.ref("StartDate")).optional(),
  DiscountPercentage: Joi.number().min(0).max(100).optional(),
  DiscountAmount: Joi.number().min(0).optional(),
  TermsAndCondition: Joi.string().allow("").optional(),
  Status: Joi.string().valid("Active", "Expired", "Upcoming").optional(),
  userEmail: Joi.string().email().optional(),
}).min(1);

module.exports = {createCouponSchema, updateCouponSchema};