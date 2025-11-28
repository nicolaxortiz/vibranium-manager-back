import Counter from "../models/Counter.js";

export const generateOrderCode = async (documentType = "CC") => {
  const year = new Date().getFullYear();
  const prefix = documentType === "CC" ? "CC" : "CO";
  const counterId = `${prefix}_order_${year}`;

  const counter = await Counter.findOneAndUpdate(
    { _id: counterId },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true }
  );

  return `${prefix}-${year}-${String(counter.sequence).padStart(6, "0")}`;
};
