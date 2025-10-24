import bcrypt from 'bcryptjs'
import genToken from '../config/token.js'
import User from '../models/user.js'

export const signUp = async (req, res) => {
  const { name, userName, email, password } = req.body;

  try {
    if (!name || !email || !password || !userName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "This email is already in use" });
    }

    const existingUserName = await User.findOne({ userName });
    if (existingUserName) {
      return res.status(400).json({ message: "This username is already in use" });
    }

    if (password.length <= 6) {
      return res.status(400).json({ message: "Password must be more than 6 characters" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      userName,
      email,
      password: hashedPassword,
      projects: []
    });

    const token = await genToken(newUser._id);

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 1000 * 60 * 60 * 24
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        _id: newUser._id,
        name: newUser.name,
        userName: newUser.userName,
        email: newUser.email,
        projects: newUser.projects,
        createdAt: newUser.createdAt
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Please fill in all required fields" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "This email is not registered" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: "Password is incorrect" });
    }

    const token = await genToken(user._id);

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 1000 * 60 * 60 * 24
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        userName: user.userName,
        email: user.email,
        projects: user.projects,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
