// utils/paginate.js
const paginate = async (Model, filter = {}, options = {}) => {
    const page = parseInt(options.page, 10) || 1;
    const limit = parseInt(options.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
        Model.find(filter)
        .skip(skip)
        .limit(limit)
        .sort(options.sort || {})
        .select(options.select || '')
        .populate(options.populate || ''),
        Model.countDocuments(filter)
    ]);

    return {
        data: products,
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit)
    };
};

module.exports = paginate;
