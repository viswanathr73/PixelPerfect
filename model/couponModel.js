const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    discription: {
        type: String,
        required: true,
    },
    offerPrice: {
        type: Number,
        required: true,
    },
    minimumAmount: {
        type: Number,
    },
    createdOn: {
        type: Date,
        default: Date.now,
    },
    expiryDate: {
        type: Date,
        required: true, 
    },
    user:{
        type:Array,
        userId:{
            type:String
        }
    }
});


couponSchema.index({ expiryDate: 1 }, { expireAfterSeconds: 0 });

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;