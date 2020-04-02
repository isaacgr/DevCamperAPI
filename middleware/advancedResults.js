const advancedResults = (model, populate) => (request, response, next) => {
  const reqQuery = { ...request.query };

  // fields to exclude
  const removeFields = ["select", "sort", "page", "limit", "skip"];
  removeFields.forEach((field) => delete reqQuery[field]);

  let query = JSON.stringify(reqQuery);
  query = query.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);
  query = JSON.parse(query);

  let dbQuery = model.find(query);

  if (request.query.select) {
    const fields = request.query.select.split(",").join(" ");
    dbQuery = dbQuery.select(fields);
  }

  if (request.query.sort) {
    const sortBy = request.query.sort.split(",").join(" ");
    dbQuery = dbQuery.sort(sortBy);
  } else {
    dbQuery = dbQuery.sort("-createdAt");
  }

  if (populate) {
    dbQuery = dbQuery.populate(populate);
  }

  // pagination
  let pagination = {};

  const page = parseInt(request.query.page, 10) || 1;
  const limit = parseInt(request.query.limit, 10) || 100;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  model
    .countDocuments()
    .then((result) => {
      const total = result;
      if (endIndex < total) {
        pagination.next = {
          page: page + 1,
          limit
        };
      } else if (startIndex > 0) {
        pagination.prev = {
          page: page - 1,
          limit
        };
      } else {
        pagination.lastPage = true;
      }
      return true;
    })
    .then(() => {
      dbQuery = dbQuery.skip(startIndex).limit(limit);

      dbQuery
        .then((result) => {
          response.advancedResults = {
            success: true,
            count: result.length,
            pagination,
            data: result
          };
          next();
        })
        .catch((error) => {
          next(error);
        });
    })
    .catch((error) => {
      next(error);
    });
};
module.exports = advancedResults;
