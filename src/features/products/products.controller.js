const productService = require("./products.service");

const getAll = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      search,
      minPrice,
      maxPrice,
      sort,
    } = req.query;
    const filters = { category, search, minPrice, maxPrice };
    const result = await productService.getAll(
      Number(page),
      Number(limit),
      filters,
      sort,
    );
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const product = await productService.getById(req.params.id);
    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

const getByCategory = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = await productService.getByCategory(
      req.params.cat,
      Number(page),
      Number(limit),
    );
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const imagePaths =
      req.files?.map((file) => `/uploads/${file.filename}`) || [];
    const product = await productService.create(req.body, imagePaths);
    res.status(201).json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const imagePaths =
      req.files?.map((file) => `/uploads/${file.filename}`) || [];
    const product = await productService.update(
      req.params.id,
      req.body,
      imagePaths,
    );
    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await productService.remove(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

const addRating = async (req, res, next) => {
  try {
    const product = await productService.addRating(
      req.params.id,
      req.user._id,
      req.body.rating,
      req.body.comment,
    );
    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
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
