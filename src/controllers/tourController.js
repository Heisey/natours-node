// ?????????????????????????????????????????????????????????
// ??????????????????? Tour Controller ?????????????????????
// ?????????????????????????????????????????????????????????

// ??????????????????? File Modules ????????????????????????
const APIFeatures = require('../utils/apiFeatures')
const Tour = require('../models/tourModel');

// ??????????????????? Node Modules ????????????????????????

// ??????????????????? Vendor Modules ??????????????????????
const chalk = require('chalk');

// ??????????????????? Middleware ??????????????????????????

// ??????????????????? route Handlers ??????????????????????



// ~~ Get All Tours
exports.getAllTours = async (req, res, next) => {

    try {

        const features = new APIFeatures(Tour.find(), req.query)

        // ~~ Apply 
        features.filter().sort().limitFields().paginate()

        // ## Query DB
        const tours = await features.query;

        // ^^ Response
        res.status(200).json({
            status: 'success',
            requestTime: req.requestTime,
            results: tours.length,
            data: {
                tours
            }
        });

        // !! Error Handler
    } catch (err) {
        // ~~ Check Env to set console response
        if (process.env.NODE_ENV === 'development') {
            console.log(chalk.red.bold.inverse('Fail: Unable to Get tours'));
        }

        // ^^ Response
        res.status(404).json({
            status: 'Failed',
            message: 'Unable to find tours',
            data: null
        });
    }
};

// ~~ Top 5 Tours
exports.getTopFive = (req, res, next) => {

    // ~~ Set query str
    req.query.limit = '5';
    req.query.sort = '-ratingAverage,price'
    req.query.fields = 'name,price,ratingAverage,summary,difficulty';

    // ~~ Call Get All Tours
    next()
}

// ~~ Get Tour By ID
exports.getTour = async (req, res, next) => {

    // ~~ Convert param.id to Number
    const id = req.params.id;

    try {
        // ## Query DB by ID for Tour
        const tour = await Tour.findById(id);

        // ^^ Response
        res.status(200).json({
            status: 'success',
            requestTime: req.requestTime,
            data: {
                tour
            }
        });

        // !! Error Handler
    } catch (err) {

        // ~~ Check Env to set console response
        if (process.env.NODE_ENV === 'development') {
            console.log(chalk.red.bold.inverse('Fail: Unable to create tour'));
        }

        // ^^ Response 404
        res.status(404).json({
            status: 'Failed',
            message: 'Unable to find tour',
            data: null
        });
    }
};

// ~~ Create Tour
exports.createTour = async (req, res, next) => {

    try {

        // ## Create Tour Model Instance
        const newTour = await Tour.create(req.body);

        // ## Save Tour to DB
        newTour.save();

        // ^^ Response
        res.status(201).send({
            status: 'success',
            requestTime: req.requestTime,
            data: {
                tour: newTour
            }
        });

        // !! Error Handler
    } catch (err) {

        // ~~ Check Env to set console response
        if (process.env.NODE_ENV === 'development') {
            console.log(chalk.red.bold.inverse('Fail: Unable to create tour'));
        }

        // ^^ Response 400
        console.log(err);
        res.status(400).json({
            status: 'Failed',
            message: 'Invalid Data Sent',
            data: err
        });
    }
};

// ~~ Update Tour
exports.updateTour = async (req, res, next) => {

    // ~~ Convert param.id to Number
    const id = req.params.id;

    try {

        // ## Query DB by ID and Update
        const tour = await Tour.findByIdAndUpdate(id, req.body, {
            new: true
        });

        // ^^ Response
        res.status(200).json({
            status: 'success',
            requestTime: req.requestTime,
            data: {
                tour
            }
        });

        // !! Error Handler
    } catch (err) {

        // ~~ Check Env to set console response
        if (process.env.NODE_ENV === 'development') {
            console.log(chalk.red.bold.inverse('Fail: Unable to update tour'));
        }

        // ^^ Response 404
        res.status(404).json({
            status: 'Failed',
            message: 'Unable to find tour',
            data: err
        });
    }
};

// ~~ Delete Tour
exports.deleteTour = async (req, res, next) => {

    // ~~ Convert param.id to Number
    const id = req.params.id;

    try {

        // ## Query DB by ID to Delete Tour
        await Tour.findByIdAndDelete(id);

        // ^^ Response
        res.status(204).json({
            status: 'success',
            requestTime: req.requestTime,
            data: null
        });

        // !! Error Handler
    } catch (err) {

        // ~~ Check Env to set console response
        if (process.env.NODE_ENV === 'development') {
            console.log(chalk.red.bold.inverse('Fail: Unable to delete tour'));
        }

        // ^^ Response 404
        res.status(404).json({
            status: 'Failed',
            message: 'Unable to find tour',
            data: null
        });
    }
};

// ~~ Get Tour Stats by Difficulty
exports.getTourStats = async (req, res, next) => {
    try {

        // ## Query DB with data aggregation
        const stats = await Tour.aggregate([{
                $match: {
                    ratingAverage: {
                        $gte: 3.0
                    }
                }
            },
            {
                $group: {
                    _id: '$difficulty',
                    numTours: {
                        $sum: 1
                    },
                    numRatings: {
                        $sum: '$ratingsQuantity'
                    },
                    averageRating: {
                        $avg: '$ratingAverage'
                    },
                    avgPrice: {
                        $avg: '$price'
                    },
                    minPrice: {
                        $min: '$price'
                    },
                    maxPrice: {
                        $max: '$price'
                    }
                }
            },
            {
                $sort: {
                    avgPrice: 1
                }
            }
        ])

        // ^^ Response
        res.status(200).json({
            status: 'success',
            requestTime: req.requestTime,
            data: {
                stats
            }
        });

        // !! Error Handler
    } catch (err) {

        // ~~ Check Env to set console response
        if (process.env.NODE_ENV === 'development') {
            console.log(chalk.red.bold.inverse('Fail: Unable to delete tour'));
        }

        // ^^ Response 400
        res.status(400).json({
            status: 'Failed',
            message: 'Unable to find tour',
            data: null
        });
    }
}

// ~~ Get Amount of Tours each month for selected year
exports.getMonthlyPlan = async (req, res, next) => {

    try {
        // ~~ Parse year
        const year = req.params.year * 1;

        // ## Query DB with Aggregation
        const plan = await Tour.aggregate([{
                $unwind: '$startDates'
            },
            {
                $match: {
                    startDates: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`)
                    }
                }
            },
            {
                $group: {
                    _id: {
                        $month: '$startDates'
                    },
                    numTourStarts: {
                        $sum: 1
                    },
                    tours: {
                        $push: '$name'
                    }
                }
            },
            {
                $addFields: {
                    month: '$_id'
                }
            },
            {
                $project: {
                    _id: 0
                }
            },
            {
                $sort: {
                    numTourStarts: -1
                }
            },
            {
                $limit: 10
            }
        ])

        // ^^ Response
        res.status(200).json({
            status: 'success',
            requestTime: req.requestTime,
            data: {
                plan
            }
        });

        // !! Error Handler
    } catch (err) {
        // ~~ Check Env to set console response
        if (process.env.NODE_ENV === 'development') {
            console.log(chalk.red.bold.inverse('Fail: Unable to delete tour'));
        }

        // ^^ Response 400
        res.status(400).json({
            status: 'Failed',
            message: 'Unable to find tour',
            data: null
        });
    }
}