// ?????????????????????????????????????????????????????????
// ??????????????????? Tour Model ??????????????????????????
// ?????????????????????????????????????????????????????????

// ??????????????????? File Modules ????????????????????????

// ??????????????????? Node Modules ????????????????????????

// ??????????????????? Vendor Modules ??????????????????????
const chalk = require('chalk');
const mongoose = require('mongoose')
const slugify = require('slugify')


const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true,
        minlength: [10, 'A tour name must be at least 10 characters'],
        maxlength: [40, 'A tour name must be less then 40 characters']
    },
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size']

    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty must be easy, medium, or difficult'
        }
    },
    ratingAverage: {
        type: Number,
        default: 3.5,
        min: [1, 'A rating must be 1 or greater'],
        max: [5, 'A rating must be 5 or less']
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function (val) {
                return val < this.price
            },
            message: 'Discount price cannot be greater then the price'
        }

    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a summary']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    slug: String,
    startLocation: {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [
        {
            type: {
                type: String,
                default: "Point",
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        },
    ],
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ],
    secretTour: {
        type: Boolean,
        default: false
    }
}, {
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    }
})

// ## Set Virtual Properties
tourSchema.virtual('durationWeeks').get(function () {
    return Math.ceil(this.duration / 7);
})

// ## Populate Reviews with virtual properties
tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
});

// ## Hook before save() and create()
// ## Set slug
tourSchema.pre('save', function (next) {

    // ~~ Create slug
    this.slug = slugify(this.name, {
        lower: true
    })

    // ~~ Call next 
    next()
})

// ## Hook before find()
// ## filter out secret tours and set start time of query
tourSchema.pre(/^find/, function (next) {

    // ~~ query start time
    this.start = Date.now();

    // ## filter out secret tours
    this.find({
        secretTour: {
            $ne: true
        }
    })

    next()
})

// ## populate guides in tours
tourSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'guides',
        select: '-__v -email -passwordChangedAt'
    })

    next()
})

// ## Hook after find()
// ~~ Log query time to console
tourSchema.post(/^find/, function (doc, next) {

    // ~~ Check Env to set console response
    if (process.env.NODE_ENV === 'development') {

        // ~~ Log Query time to console
        console.log(chalk.magenta.bold.inverse(`Query took ${Date.now() - this.start} milliseconss`))
    }

    // ~~ Next function
    next()
})



// ## Hook before aggregate()
tourSchema.pre('aggregate', function (next) {

    // ~~ query start time
    this.start = Date.now();

    // ## Remove secret tours from aggregation
    this.pipeline().unshift({
        $match: {
            secretTour: {
                $ne: true
            }
        }
    })

    // ~~ Call next 
    next()
})

// ## Hook after aggregate()
// ~~ Log query time to console
tourSchema.post('aggregate', function () {

    // ~~ Check Env to set console response
    if (process.env.NODE_ENV === 'development') {

        // ~~ Log Query time to console
        console.log(chalk.green.bold.inverse(`Query took ${Date.now() - this.start} milliseconss`))
    }
})

// ## Attach Tour model to tour schema
const Tour = mongoose.model('Tour', tourSchema)

module.exports = Tour