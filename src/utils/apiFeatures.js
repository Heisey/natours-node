class APIFeatures {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }

    filter() {

        // ~~ Create query obj
        const queryObj = {
            ...this.queryStr
        };

        // ~~ Fields that are to be excluded from query
        const excludedFields = ['page', 'sort', 'limit', 'fields'];

        // ~~ Filter excluded fields from queryObj
        excludedFields.forEach(el => delete queryObj[el]);

        // ~~ Convert queryObj to string
        let queryStr = JSON.stringify(queryObj);

        // ~~ Append $ to proper params
        queryStr = queryStr.replace(/\b(gte?|lte?)\b/g, match => `\$${match}`);

        // ## Query DB for Tours with queryObj
        this.query = this.query.find(JSON.parse(queryStr))
        // let query = Tour.find(JSON.parse(queryStr));

        return this
    }

    sort() {

        // ~~ Sort results
        if (this.queryStr.sort) {

            // ~~ Get sorting fields
            const sortBy = this.queryStr.sort.split(',').join(' ');

            // ~~ Update query str
            this.query = this.query.sort(sortBy);
        } else {

            // ~~ Default sorting
            this.query = this.query.sort('-createdAt');
        }

        return this
    }

    limitFields() {

        // ~~ Select Fields
        if (this.queryStr.fields) {

            // ~~ Get sorting fields
            const fields = this.queryStr.fields.split(',').join(' ');

            // ~~ Update query str
            this.query = this.query.select(fields);
        } else {

            // ~~ Default fields 
            this.query = this.query.select('-__v');
        }

        return this
    }

    paginate() {
        // ~~ Pagination 
        // ~~ Parse variables or set defaults
        const page = this.queryStr.page * 1 || 1;
        const limit = this.queryStr.limit * 1 || 100;

        // ~~ Pagination
        // ~~ Set skip value
        const skip = (page - 1) * limit;

        // ~~ Pagination  
        // ~~ Update query str
        this.query = this.query.skip(skip).limit(limit)

        return this
    }
}

module.exports = APIFeatures