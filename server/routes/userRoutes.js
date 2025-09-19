const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Student = require('../models/studentModel');
const { protect, isTeacher } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   POST /api/users/register
// @desc    Register a new user (student or teacher)
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { fullName, username, password, role, schoolCode, studentClass } = req.body;

        if (!fullName || !username || !password || !role || !schoolCode) {
            return res.status(400).json({ msg: 'Please enter all required fields.' });
        }
        if (role === 'student' && !studentClass) {
            return res.status(400).json({ msg: 'Please provide a class for the student.' });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ msg: 'A user with this username already exists.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName,
            username,
            password: hashedPassword,
            role,
            schoolCode,
            class: studentClass
        });

        const savedUser = await newUser.save();

        if (savedUser.role === 'student') {
            const newStudent = new Student({
                userId: savedUser._id
            });
            await newStudent.save();
        }

        res.status(201).json({ msg: 'User registered successfully!', userId: savedUser._id });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error during registration.' });
    }
});

// @route   POST /api/users/login
// @desc    Authenticate a user and get a token
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ msg: 'Please enter both username and password.' });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials. User not found.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials. Password does not match.' });
        }

        const payload = {
            user: {
                id: user._id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '3h' },
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

// @route   GET /api/users/students
// @desc    Get all students from the teacher's school
// @access  Private (Teachers only)
router.get('/students', [protect, isTeacher], async (req, res) => {
    try {
        const teacher = await User.findById(req.user.id);
        if (!teacher) {
            return res.status(404).json({ msg: 'Teacher not found.' });
        }

        const students = await User.find({
            role: 'student',
            schoolCode: teacher.schoolCode
        }).select('-password');

        res.json(students);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error.' });
    }
});

module.exports = router;