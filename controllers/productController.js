import Product from "../models/Product.js";

export const createProduct = async (req, res) => {
  try {
    const { code, name, price, specifications } = req.body;

    const newProduct = new Product({
      code,
      name,
      price,
      specifications,
    });

    const savedProduct = await newProduct.save();

    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({
      message: "Error creating product",
      error: error.message,
    });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ name: 1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching products",
      error: error.message,
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching product",
      error: error.message,
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({
      message: "Error updating product",
      error: error.message,
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting product",
      error: error.message,
    });
  }
};

export const searchProducts = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;

    const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const safe = escapeRegExp(search);
    const partialRegex = new RegExp(safe, "i");

    const filters = {
      $or: [{ name: partialRegex }, { code: partialRegex }],
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const results = await Product.find(filters)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Product.countDocuments({
      ...filters,
    });

    res.json({
      products: results,
      pagination: {
        page: parseInt(page),
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error searching products",
      error: error.message,
    });
  }
};

export const saveManyProducts = async (req, res) => {
  try {
    const products = req.body; // Espera un array de productos

    // Validar que sea un array
    if (!Array.isArray(products)) {
      return res.status(400).json({ error: "Se espera un array de productos" });
    }

    // Insertar todos con validación de Mongoose
    const inserted = await Product.insertMany(products, { ordered: false });

    res.status(201).json({
      message: "Productos creados exitosamente",
      count: inserted.length,
      products: inserted,
    });
  } catch (error) {
    res.status(400).json({
      error: "Error al crear productos",
      details: error.message,
    });
  }
};
