import Customer from "../models/Customer.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalCustomers,
      totalProducts,
      cuentasCobro,
      cotizaciones,
      ordersThisMonth,
      totalPaidThisMonth,
    ] = await Promise.all([
      Customer.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments({ documentType: "CC" }),
      Order.countDocuments({ documentType: "CO" }),
      Order.countDocuments({
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      }),
      Order.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(
                new Date().getFullYear(),
                new Date().getMonth(),
                1
              ),
            },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$paid" },
          },
        },
      ]),
    ]);

    // --- Clientes por mes (últimos 6 meses) ---
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);

    const customersByMonth = await Customer.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const paymentsByMonth = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          documentType: "CC",
        },
      },
      {
        $addFields: {
          totalInvoiced: {
            $reduce: {
              input: "$products",
              initialValue: 0,
              in: {
                $add: [
                  "$$value",
                  { $multiply: ["$$this.quantity", "$$this.price"] },
                ],
              },
            },
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          totalPaid: { $sum: "$paid" },
          totalInvoiced: { $sum: "$totalInvoiced" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const clientsWithDebt = await Order.aggregate([
      {
        $match: {
          documentType: "CC",
          // paid: { $lt: { $sum: "$products.quantity * $products.price" } }
        },
      },
      {
        $addFields: {
          totalInvoiced: {
            $reduce: {
              input: "$products",
              initialValue: 0,
              in: {
                $add: [
                  "$$value",
                  { $multiply: ["$$this.quantity", "$$this.price"] },
                ],
              },
            },
          },
        },
      },
      {
        $group: {
          _id: "$customerId",
          totalInvoiced: { $sum: "$totalInvoiced" },
          totalPaid: { $sum: "$paid" },
          ordersCount: { $sum: 1 },
        },
      },
      {
        $addFields: {
          debt: { $subtract: ["$totalInvoiced", "$totalPaid"] },
        },
      },
      {
        $match: { debt: { $gt: 0 } },
      },
      {
        $lookup: {
          from: "customers",
          localField: "_id",
          foreignField: "_id",
          as: "customer",
        },
      },
      { $unwind: "$customer" },
      {
        $project: {
          name: "$customer.name",
          document: "$customer.document",
          phone: "$customer.phone",
          email: "$customer.email",
          totalInvoiced: 1,
          totalPaid: 1,
          debt: 1,
          ordersCount: 1,
        },
      },
      { $sort: { debt: -1 } },
      { $limit: 7 },
    ]);

    const monthNames = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ];
    const formattedCustomersByMonth = customersByMonth.map((item) => ({
      month: monthNames[item._id.month - 1],
      year: item._id.year,
      count: item.count,
      label: `${monthNames[item._id.month - 1]} ${item._id.year}`,
    }));

    const formattedPaymentsByMonth = paymentsByMonth.map((item) => ({
      month: monthNames[item._id.month - 1],
      year: item._id.year,
      label: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      totalPaid: item.totalPaid,
      totalInvoiced: item.totalInvoiced,
      pending: item.totalInvoiced - item.totalPaid,
    }));

    const last12Months = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      const existing = formattedCustomersByMonth.find(
        (m) => m.label === monthKey
      );
      last12Months.push(
        existing || {
          month: monthNames[date.getMonth()],
          count: 0,
        }
      );
    }

    const last12MonthsPayments = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      const existing = formattedPaymentsByMonth.find(
        (m) => m.label === monthKey
      );
      last12MonthsPayments.push(
        existing || {
          month: monthNames[date.getMonth()],
          year: date.getFullYear(),
          totalPaid: 0,
          totalInvoiced: 0,
          pending: 0,
        }
      );
    }

    res.json({
      customers: totalCustomers,
      products: totalProducts,
      cc: cuentasCobro,
      co: cotizaciones,
      totalOrders: cuentasCobro + cotizaciones,
      ordersThisMonth,
      customersByMonth: last12Months,
      revenueThisMonth: totalPaidThisMonth[0]?.total || 0,
      paymentsByMonth: last12MonthsPayments,
      totalInvoiced: last12MonthsPayments.reduce(
        (sum, m) => sum + m.totalInvoiced,
        0
      ),
      totalPaid: last12MonthsPayments.reduce((sum, m) => sum + m.totalPaid, 0),
      totalPending: last12MonthsPayments.reduce((sum, m) => sum + m.pending, 0),
      clientsWithDebt,
    });
  } catch (error) {
    console.error("Error dashboard:", error);
    res.status(500).json({ message: "Error al cargar estadísticas" });
  }
};
