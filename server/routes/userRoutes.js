// userRoutes.js

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Student = require('../models/studentModel');

// Create a new router object
const router = express.Router();

//============================================//
//==         1. REGISTER A NEW USER         ==//
//============================================//
// @route   POST /api/users/register
// @desc    Register a new user (student or teacher)
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { fullName, username, password, role, schoolCode, studentClass } = req.body;

        // --- Basic Validation ---
        if (!fullName || !username || !password || !role || !schoolCode) {
            return res.status(400).json({ msg: 'Please enter all required fields.' });
        }
        if (role === 'student' && !studentClass) {
            return res.status(400).json({ msg: 'Please provide a class for the student.' });
        }

        // --- Check if user already exists ---
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ msg: 'A user with this username already exists.' });
        }

        // --- Hash the password ---
        const salt = await bcrypt.genSalt(10); // Generate a salt
        const hashedPassword = await bcrypt.hash(password, salt); // Create the hash

        // --- Create a new User document ---
        const newUser = new User({
            fullName,
            username,
            password: hashedPassword,
            role,
            schoolCode,
            class: studentClass // 'class' is the field name in the model
        });

        // --- Save the new user to the database ---
        const savedUser = await newUser.save();

        // --- If the new user is a student, create a corresponding student progress document ---
        if (savedUser.role === 'student') {
            const newStudent = new Student({
                userId: savedUser._id // Link to the User document
            });
            await newStudent.save();
        }

        res.status(201).json({ msg: 'User registered successfully!', userId: savedUser._id });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error during registration.' });
    }
});


//============================================//
//==            2. LOGIN A USER             ==//
//============================================//
// @route   POST /api/users/login
// @desc    Authenticate a user and get a token
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // --- Basic Validation ---
        if (!username || !password) {
            return res.status(400).json({ msg: 'Please enter both username and password.' });
        }

        // --- Find user by username ---
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials. User not found.' });
        }

        // --- Compare the provided password with the stored hashed password ---
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials. Password does not match.' });
        }

        // --- If credentials are correct, create a JWT payload ---
        const payload = {
            user: {
                id: user._id,
                role: user.role
            }
        };

        // --- Sign the token ---
        jwt.sign(
            payload,
            process.env.JWT_SECRET, // Your secret key from .env
            { expiresIn: '3h' }, // Token expires in 3 hours
            (err, token) => {
                if (err) throw err;
                res.json({
                    token,
                    user: {
                        id: user._id,
                        fullName: user.fullName,
                        role: user.role,
                        class: user.class
                    }
                });
            }
        );

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error during login.' });
    }
});


// Export the router to be used in server.js
module.exports = router;