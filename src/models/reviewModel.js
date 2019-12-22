// ?????????????????????????????????????????????????????????
// ??????????????????? Review Model ????????????????????????
// ?????????????????????????????????????????????????????????

// ??????????????????? File Modules ????????????????????????
const Tour = require('./tourModel')
// ??????????????????? Node Modules ????????????????????????

// ??????????????????? Vendor Modules ??????????????????????
const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'A review cannot be empty'],
        minlength: [10, 'A review must be at least 10 characters'],
        maxlength: [250, 'A review must be less then 250 characters']
    },
    rating: {
        type: Number,
        required: [true, 'Please provide a rating'],
        min: [1, 'A rating must be greater then 1'],
        max: [5, 'A rating must be less then 5']
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'A review must belong to a tour']
    }
    ,
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'A review must belong to a user']
    }
}, {
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    }
})

reviewSchema.index({ tour: 1, user: 1 }, { unique: true })

// ## Hook before find()
// ## populate user in review
reviewSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'user',
        select: 'name photo'
    })

    next()
})

// ## Update average ratings
reviewSchema.pre(/^findOneAnd/, async function(next) {

    this.r = await this.fineOne()

    next()
})

// ## static methods
// ## Calc average rating handler
reviewSchema.statics.calcAverageRatings = async function(tourId) {
    const stats = await this.aggregate([
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ])

    if (stats.length === 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingAverage: 4.5
        })
    }

    await Tour.findByIdAndUpdate(tourId, {
        ratingsQuantity: stats[0].nRating,
        ratingAverage: stats[0].avgRating
    })
} 

// ## Hook post find
// ## Update average ratings
reviewSchema.post(/^findOneAnd/, async function() {

    await this.r.constructor.calcAverageRatings(this.r.tour)
})

// ## Hook post save()
// ~~ Calc Average Ratings
reviewSchema.post('save', function() {
    
    // ~~ Call calcAverageRatings on tour
    this.constructor.calcAverageRatings(this.tour)

})

const Review = mongoose.model('Review', reviewSchema)

module.exports = Review