import Customer from "../models/Customer.js";

export const createCustomer = async (req, res) => {
  try {
    const newCustomer = new Customer(req.body);

    await newCustomer.save();
    res.status(201).json(newCustomer);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error creating customer", error: error.message });
  }
};

// Get all customers
export const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching customers", error: error.message });
  }
};

// Get a single customer by ID
export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });
    res.json(customer);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching customer", error: error.message });
  }
};

export const searchCustomers = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();

    if (!q) {
      return res.status(400).json({
        message: "Please provide a search query using the 'q' parameter.",
      });
    }

    // Escapa caracteres especiales para usar en RegExp
    const escapeRegExp = (string) =>
      string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const escaped = escapeRegExp(q);
    const partialRegex = new RegExp(escaped, "i"); // partial, case-insensitive
    const startsWithRegex = new RegExp("^" + escaped, "i"); // startsWith (useful for documentId)

    // Construimos filtros: si coincide en cualquiera de estos campos
    const filters = {
      $or: [{ name: partialRegex }, { document: startsWithRegex }],
    };

    const results = await Customer.find(filters);

    res.json(results);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error searching customers", error: error.message });
  }
};

// Update customer
export const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });
    res.json(customer);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating customer", error: error.message });
  }
};

// Delete customer
export const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });
    res.json({ message: "Customer deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting customer", error: error.message });
  }
};
