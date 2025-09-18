// courseRoutes.js

const express = require('express');
const Course = require('../models/courseModel');
const { protect, isTeacher } = require('../middleware/authMiddleware'); // Import our new middleware

const router = express.Router();


//==============================================================//
//==  1. FETCH ALL COURSES FOR A STUDENT'S CLASS (for students) ==//
//==============================================================//
// @route   GET /api/courses/:class
// @desc    Get all courses for a specific class
// @access  Private (Requires login)
router.get('/:class', protect, async (req, res) => {
    try {
        const courses = await Course.find({ class: req.params.class });
        if (!courses || courses.length === 0) {
            return res.status(404).json({ msg: 'No courses found for this class.' });
        }
        res.json(courses);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error.' });
    }
});


//==============================================================//
//==       2. FETCH A SINGLE COURSE BY ID (for students)       ==//
//==============================================================//
// @route   GET /api/courses/course/:id
// @desc    Get a single course by its unique ID
// @access  Private (Requires login)
router.get('/course/:id', protect, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ msg: 'Course not found.' });
        }
        res.json(course);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error.' });
    }
});


//==============================================================//
//==          3. CREATE A NEW COURSE (for teachers)           ==//
//==============================================================//
// @route   POST /api/courses
// @desc    Create a new course
// @access  Private (Teachers only)
router.post('/', [protect, isTeacher], async (req, res) => {
    // Note: We use an array [protect, isTeacher] to apply multiple middleware functions
    try {
        const { subject, class: courseClass, title, description, modules } = req.body;

        // --- Basic Validation ---
        if (!subject || !courseClass || !title || !description || !modules) {
            return res.status(400).json({ msg: 'Please provide all required fields for the course.' });
        }

        // --- Create a new Course document ---
        const newCourse = new Course({
            subject,
            class: courseClass,
            title,
            description,
            modules
        });

        // --- Save the new course to the database ---
        const savedCourse = await newCourse.save();

        res.status(201).json(savedCourse); // Send back the newly created course

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error while creating course.' });
    }
});


module.exports = router;