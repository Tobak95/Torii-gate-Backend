const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const propertySchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        location: {
            type: String,
            required: true,
        },
        bedrooms: {
            type: Number,
            required: true,
            min: 0,
        },
        livingRooms: {
            type: Number,
            required: true,
            min: 0,
        },
        kitchens: {
            type: Number,
            required: true,
            min: 0,
        },
        toilet: {
            type: Number,
            required: true,
            min: 0,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        paymentPeriod: {
            type: String,
            enum: ["weekly", "monthly", "yearly"],
            required: true,
        },
        images: {
            type: [String],
            enum: ['rented', 'available'],
            default: 'available',
        },
        landlord: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        }

    }, { timestamps: true });

//manual api documentation..
const PROPERTY = mongoose.model("property", propertySchema);
module.exports = PROPERTY;
