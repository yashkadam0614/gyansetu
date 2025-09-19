// server/routes/studentRoutes.js

const express = require('express');
const Student = require('../models/studentModel');
const { protect } = require('../middleware/authMiddleware'); // Our security guard middleware

const router = express.Router();

// @route   GET /api/students/me
// @desc    Get the progress data for the logged-in student
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        // req.user.id is attached to the request by the 'protect' middleware
        const studentData = await Student.findOne({ userId: req.user.id });

        if (!studentData) {
            return res.status(404).json({ msg: 'Student data not found.' });
        }

        res.json(studentData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error.' });
    }
});

module.exports = router;