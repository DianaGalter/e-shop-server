const Product = require("./product.model");

const buildQuery = (filters) => {
  const query = { isActive: true };
  if (filters.category) query.category = filters.category;
  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: "i" } },
      { description: { $regex: filters.search, $options: "i" } },
    ];
  }
  if (filters.minPrice || filters.maxPrice) {
    query.price = {};
    if (filters.minPrice) query.price.$gte = Number(filters.minPrice);
    if (filters.maxPrice) query.price.$lte = Number(filters.maxPrice);
  }
  return query;
};

const buildSort = (sort) => {
  const map = {
    price: "price",
    date: "createdAt",
    name: "name",
    rating: "averageRating",
  };
  const order = sort?.startsWith("-") ? -1 : 1;
  const field = sort?.replace("-", "") || "createdAt";
  return { [map[field] || "createdAt"]: order };
};

const getAll = async (page = 1, limit = 20, filters = {}, sort) => {
  const skip = (page - 1) * limit;
  const query = buildQuery(filters);
  const sortOption = buildSort(sort);

  const [products, total] = await Promise.all([
    Product.find(query)
      .select("name price images averageRating category stock")
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(query),
  ]);

  return {
    data: products,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalCount: total,
  };
};

const getById = async (id) => {
  const product = await Product.findById(id).populate("ratings.user", "name");
  if (!product)
    throw Object.assign(new Error("Product not found"), { statusCode: 404 });
  return product;
};

const getByCategory = async (category, page = 1, limit = 20) => {
  return getAll(page, limit, { category });
};

const create = async (data, imagePaths = []) => {
  const images = imagePaths.length ? imagePaths : data.images || [];
  const product = await Product.create({ ...data, images });
  return product;
};

const update = async (id, data, imagePaths) => {
  const product = await Product.findById(id);
  if (!product)
    throw Object.assign(new Error("Product not found"), { statusCode: 404 });

  const updated = { ...data };
  if (imagePaths?.length)
    updated.images = [...(product.images || []), ...imagePaths];

  Object.assign(product, updated);
  await product.save();
  return product;
};

const remove = async (id) => {
  const product = await Product.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true },
  );
  if (!product)
    throw Object.assign(new Error("Product not found"), { statusCode: 404 });
  return product;
};

const addRating = async (productId, userId, rating, comment) => {
  const product = await Product.findById(productId);
  if (!product)
    throw Object.assign(new Error("Product not found"), { statusCode: 404 });

  const existing = product.ratings.find(
    (rate) => rate.user?.toString() === userId,
  );
  if (existing) {
    existing.rating = rating;
    existing.comment = comment;
  } else {
    product.ratings.push({ user: userId, rating, comment });
  }

  const sum = product.ratings.reduce((accum, rate) => accum + rate.rating, 0);
  product.averageRating = Number(
    (sum / product.ratings.length).toFixed(2),
  );
  await product.save();
  return product;
};

module.exports = {
  getAll,
  getById,
  getByCategory,
  create,
  update,
  remove,
  addRating,
};
