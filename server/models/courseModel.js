const mongoose = require('mongoose');
const { Schema } = mongoose;

// A reusable schema for multilingual content
const contentSchema = {
    en: { type: String, required: true },
    hi: { type: String, required: true },
    pa: { type: String, required: true },
};

const quizQuestionSchema = new Schema({
    question: contentSchema,
    options: [contentSchema], // Array of possible answers
    correctOptionIndex: { type: Number, required: true }
});

const moduleSchema = new Schema({
    moduleTitle: contentSchema,
    type: {
        type: String,
        enum: ['video', 'pdf', 'quiz'],
        required: true
    },
    url: {
        type: String,
        // URL is not required for quizzes
        required: function() { return this.type === 'video' || this.type === 'pdf'; }
    },
    quizQuestions: {
        type: [quizQuestionSchema],
        // Questions are only required if the module type is 'quiz'
        required: function() { return this.type === 'quiz'; }
    }
});

const courseSchema = new mongoose.Schema({
    subject: { type: String, required: true },
    class: { type: Number, required: true },
    title: contentSchema,
    description: contentSchema,
    modules: [moduleSchema] // An array of modules
}, { timestamps: true });

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;