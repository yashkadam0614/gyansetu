const mongoose = require('mongoose');
const { Schema } = mongoose;

const studentSchema = new mongoose.Schema({
    // This creates a direct link to a document in the 'User' collection
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    points: {
        type: Number,
        default: 0
    },
    badges: {
        type: [String], // An array of strings
        default: []
    },
    completedCourses: {
        type: [Schema.Types.ObjectId], // An array of Course IDs
        ref: 'Course',
        default: []
    },
    quizScores: {
        type: Map,
        of: Number // A map to store scores, e.g., { "quizId1": 90, "quizId2": 85 }
    }
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;