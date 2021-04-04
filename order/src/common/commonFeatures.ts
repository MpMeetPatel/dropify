class CommonFeatures {
  [x: string]: any;
  constructor(query: any, queryObj: Object) {
    this.query = query;
    this.queryObj = queryObj;
  }

  select() {
    if (this.queryObj.select) {
      const select = this.queryObj.select.split(",").join(" ");
      this.query = this.query.select(select);
    }
    return this;
  }

  paginate() {
    const page = this.queryObj.page * 1 || 1;
    const limit = this.queryObj.limit * 1 || 20;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }

  sort() {
    if (this.queryObj.sort) {
      const sortBy = this.queryObj.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }

    return this;
  }

  filter() {
    const queryObj = { ...this.queryObj };
    const excludedQueryFields = ["page", "sort", "limit", "select"];
    excludedQueryFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|in|nin)\b/g,
      (match) => `$${match}`
    );

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }
}

export { CommonFeatures };
