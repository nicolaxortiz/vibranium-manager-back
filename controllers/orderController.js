import Order from "../models/Order.js";
import Customer from "../models/Customer.js";
import { generateOrderCode } from "../utils/generateOrderCode.js";
import pkg from "../documents/CC.cjs";
const { downloadCC } = pkg;

// Crear una orden
export const createOrder = async (req, res) => {
  try {
    const { customerId, products, documentType, paid, specification } =
      req.body;

    const code = await generateOrderCode(documentType);

    const newOrder = new Order({
      code,
      customerId,
      products,
      documentType,
      paid,
      specification,
    });

    const savedOrder = await newOrder.save();

    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Obtener todas las órdenes
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("customerId");

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener una orden por ID
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("customerId");

    if (!order) return res.status(404).json({ message: "Orden no encontrada" });

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const searchOrders = async (req, res) => {
  try {
    const {
      customerName,
      customerDocument,
      documentType,
      fromDate,
      toDate,
      page = 1,
      limit = 10,
    } = req.query;

    // Construcción dinámica del filtro
    const filter = {};
    const customerFilter = {};

    // 1. Filtro por nombre del cliente
    if (customerName?.trim()) {
      customerFilter.name = { $regex: customerName.trim(), $options: "i" };
    }

    // 2. Filtro por documento/NIT del cliente
    if (customerDocument?.trim()) {
      customerFilter.document = {
        $regex: customerDocument.trim(),
        $options: "i",
      };
    }

    // 3. Filtro por tipo de documento de la orden (CC, CO)
    if (documentType && ["CC", "CO"].includes(documentType)) {
      filter.documentType = documentType;
    }

    // 4. Rango de fechas de creación
    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) {
        filter.createdAt.$gte = new Date(fromDate);
      }
      if (toDate) {
        const endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endDate;
      }
    }

    // Paginación
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Consulta principal con populate condicional
    const orders = await Order.find(filter)
      .populate({
        path: "customerId",
        match: Object.keys(customerFilter).length > 0 ? customerFilter : null,
        select: "name document email phone", // ajusta según tus campos reales
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Filtrar órdenes donde customerId sea null (porque no coincidió con el filtro del cliente)
    const validOrders = orders.filter((order) => order.customerId !== null);

    // Total de resultados (para paginación)
    const total = await Order.countDocuments({
      ...filter,
      ...(Object.keys(customerFilter).length > 0 && {
        customerId: {
          $in: await Customer.find(customerFilter).distinct("_id"),
        },
      }),
    });

    res.json({
      orders: validOrders,
      pagination: {
        page: parseInt(page),
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Error en búsqueda de órdenes:", error);
    res
      .status(500)
      .json({ message: "Error del servidor", error: error.message });
  }
};

// Actualizar una orden
export const updateOrder = async (req, res) => {
  try {
    const updated = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!updated)
      return res.status(404).json({ message: "Orden no encontrada" });

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Eliminar una orden
export const deleteOrder = async (req, res) => {
  try {
    const deleted = await Order.findByIdAndDelete(req.params.id);

    if (!deleted)
      return res.status(404).json({ message: "Orden no encontrada" });

    res.json({ message: "Orden eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const downloadOrder = async (req, res) => {
  let orderId = req.params.id;

  try {
    const order = await Order.findById(orderId).populate("customerId");

    if (!order) return res.status(404).json({ message: "Orden no encontrada" });

    downloadCC(res, order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
