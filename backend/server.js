require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const Student = require('./models/Student');
const Course = require('./models/Course');
const Enrollment = require('./models/Enrollment');

const app = express();
app.use(cors());
app.use(express.json());

// ---------- MongoDB connection ----------
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

// ================= STUDENTS =================

// Get all students
app.get('/api/students', async (req, res) => {
    try {
        const students = await Student.find();
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Search for a student by name
app.get('/api/students/search', async (req, res) => {
    try {
        const { name } = req.query;
        if (!name) {
            return res.status(400).json({ error: 'Name query parameter is required' });
        }
        const student = await Student.findOne({ name: new RegExp(`^${name}$`, 'i') });
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        res.json(student);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add a student
app.post('/api/students', async (req, res) => {
    try {
        const { name, studentId, phone, zip } = req.body;
        if (!name || !studentId || !phone || !zip) {
            return res.status(400).json({ error: 'All fields (name, studentId, phone, zip) are required' });
        }
        const existing = await Student.findOne({ studentId });
        if (existing) {
            return res.status(409).json({ error: 'A student with this ID already exists' });
        }
        const student = new Student({ name, studentId, phone, zip });
        await student.save();
        res.status(201).json(student);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete a student by studentId (also removes their enrollments)
app.delete('/api/students/:studentId', async (req, res) => {
    try {
        const student = await Student.findOneAndDelete({ studentId: req.params.studentId });
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        await Enrollment.deleteMany({ studentId: req.params.studentId });
        res.json({ message: 'Student deleted successfully', student });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ================= COURSES =================

// Get all courses
app.get('/api/courses', async (req, res) => {
    try {
        const courses = await Course.find();
        res.json(courses);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add a course
app.post('/api/courses', async (req, res) => {
    try {
        const { courseId, courseName } = req.body;
        if (!courseId || !courseName) {
            return res.status(400).json({ error: 'Both courseId and courseName are required' });
        }
        const existing = await Course.findOne({ courseId });
        if (existing) {
            return res.status(409).json({ error: 'A course with this ID already exists' });
        }
        const course = new Course({ courseId, courseName });
        await course.save();
        res.status(201).json(course);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete a course by courseId (also removes its enrollments)
app.delete('/api/courses/:courseId', async (req, res) => {
    try {
        const course = await Course.findOneAndDelete({ courseId: req.params.courseId });
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        await Enrollment.deleteMany({ courseId: req.params.courseId });
        res.json({ message: 'Course deleted successfully', course });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ================= ENROLLMENTS =================

// Enroll a student in a course
app.post('/api/enrollments', async (req, res) => {
    try {
        const { studentId, courseId } = req.body;
        if (!studentId || !courseId) {
            return res.status(400).json({ error: 'Both studentId and courseId are required' });
        }
        const student = await Student.findOne({ studentId });
        if (!student) {
            return res.status(404).json({ error: 'Student does not exist' });
        }
        const course = await Course.findOne({ courseId });
        if (!course) {
            return res.status(404).json({ error: 'Course does not exist' });
        }
        const existing = await Enrollment.findOne({ studentId, courseId });
        if (existing) {
            return res.status(409).json({ error: 'This student is already enrolled in this course' });
        }
        const enrollment = new Enrollment({ studentId, courseId });
        await enrollment.save();
        res.status(201).json(enrollment);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all students enrolled in a course
app.get('/api/enrollments', async (req, res) => {
    try {
        const { courseId } = req.query;
        if (!courseId) {
            return res.status(400).json({ error: 'courseId query parameter is required' });
        }
        const enrollments = await Enrollment.find({ courseId });
        const studentIds = enrollments.map((e) => e.studentId);
        const students = await Student.find({ studentId: { $in: studentIds } });
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ================= SERVE PRODUCTION BUILD =================
app.use(express.static(path.join(__dirname, 'public')));
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ---------- Start server ----------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
