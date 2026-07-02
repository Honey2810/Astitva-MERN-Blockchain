import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

/**
 * @desc    Register a new registrar or admin user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res, next) => {
  const { name, email, password, role } = req.body;

  try {
    // 1. Validation check
    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Please provide name, email, and password');
    }

    // 2. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists with this email address');
    }

    // 3. Create user in database (pre-save hook hashes password)
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'registrar', // Defaults to registrar
    });

    if (user) {
      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(400);
      throw new Error('Invalid user registration data');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token (Login)
 * @route   POST /api/auth/login
 * @access  Public
 */
export const authUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // 1. Validation check
    if (!email || !password) {
      res.status(400);
      throw new Error('Please enter email and password');
    }

    // 2. Check user existence
    const user = await User.findOne({ email });

    // 3. Compare passwords using matchPassword schema method
    if (user && (await user.matchPassword(password))) {
      res.status(200).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user profile data
 * @route   GET /api/auth/profile
 * @access  Private
 */
export const getUserProfile = async (req, res, next) => {
  try {
    // req.user has been attached by the protect middleware
    const user = await User.findById(req.user._id).select('-password');
    
    if (user) {
      res.status(200).json({
        success: true,
        data: user,
      });
    } else {
      res.status(404);
      throw new Error('User record not found');
    }
  } catch (error) {
    next(error);
  }
};
