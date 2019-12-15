// ?????????????????????????????????????????????????????????
// ?????????????? Handler Factory Functions ????????????????
// ?????????????????????????????????????????????????????????

// ??????????????????? File Modules ????????????????????????
// ?? Utilities
const APIFeatures = require('../utils/apiFeatures')
const AppError = require('./appError')
const catchAsync = require('./catchAsync')

// ??????????????????? Node Modules ????????????????????????

// ??????????????????? Vendor Modules ??????????????????????

// ~~ Delete a document factory function
exports.deleteOne = Model => catchAsync(async (req, res, next) => {

    // ~~ Convert param.id to Number
    const id = req.params.id;

    // ## Query DB by ID to Delete 
    const doc = await Model.findByIdAndDelete(id);

    // !! Error Handler
    if (!doc) {
        return next(new AppError('No document found', 404))
    }

    // ^^ Response
    res.status(204).json({
        status: 'success',
        requestTime: req.requestTime,
        data: null
    });
});


// ~~ Update a document factory function
exports.updateOne = Model => catchAsync(async (req, res, next) => {

    // ~~ Convert param.id to Number
    const id = req.params.id;

    // ## Query DB by ID and Update
    const data = await Model.findByIdAndUpdate(id, req.body, {
        new: true
    });

    // !! Error Handler
    if (!data) {
        return next(new AppError('No data found', 404))
    }

    // ^^ Response
    res.status(200).json({
        status: 'success',
        requestTime: req.requestTime,
        data: {
            data
        }
    });
});

// ~~ Create a document factory function
exports.createOne = Model => catchAsync(async (req, res, next) => {

    // ## Create Model Instance
    const data = await Model.create(req.body);

    // ## Save to DB
    await data.save();

    // ^^ Response
    res.status(201).send({
        status: 'success',
        requestTime: req.requestTime,
        data: {
            data
        }
    });
});

// ~~ Get all documents factory function
exports.getAll = Model => catchAsync(async (req, res, next) => {

    // ~~ To allow for nested GET reviews on tour
    let filter = {}

    if (req.params.id) filter = { tour: req.params.id }

    // ~~ Create  feature instance
    const features = new APIFeatures(Model.find(filter), req.query)

    // ~~ Apply selected features
    features.filter().sort().limitFields().paginate()

    // ## Query DB for all
    const data = await await features.query;

    // ^^ Response
    res.status(200).json({
        status: 'success',
        results: data.length,
        data: {
            data
        }
    })
})

// ~~ Get a document factory function
exports.getOne = (Model, popOptions) => catchAsync(async (req, res, next) => {

    // ~~ param id
    const id = req.params.id;

    // ~~ query
    let query = Model.findById(id)

    // ~~ check for population
    if (popOptions) {
        query = query.populate(popOptions)
    }

    // ## Query DB by ID for Tour
    const data = await query

    // !! Error Handler
    if (!data) {
        return next(new AppError('No data found', 404))
    }

    // ^^ Response
    res.status(200).json({
        status: 'success',
        requestTime: req.requestTime,
        data: {
            data
        }
    });
})