import User from "../models/User.js";
import jwt from "jsonwebtoken";

// Registro de usuario
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "El correo ya está registrado" });

    const user = new User({ name, email, password });
    await user.save();

    // Generar token JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al registrar usuario: " + error.message });
  }
};

// Login de usuario
export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Contraseña incorrecta" });

    // Generar token JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al iniciar sesión: " + error.message });
  }
};

export const validateLogin = async (req, res) => {
  res.json({
    message: "Login validado",
  });
};
