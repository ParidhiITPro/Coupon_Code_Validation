const mongoose = require('mongoose')


const couponSchema = new mongoose.Schema({
    OfferName: {type: String, required: true},
    CouponCode: {type: String, required: true, unique: true},
    StartDate: {type: Date, required: true},
    EndDate: {type: Date, required: true},
    DiscountPercentage: {type: Number, default: 0},
    DiscountAmount: {type: Number, default: 0},
    TermAndCondition: {type: String},
    Status: {type: String, enum: ["Active", "Expired", "Upcoming"], default: "Active"},
})

module.exports = mongoose.model("Coupon", couponSchema);