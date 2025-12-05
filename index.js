import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import customerRoutes from "./routes/costumerRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();

connectDB();

app.use(express.json());

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use("/api/customers", customerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Servidor y MongoDB conectados correctamente");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
