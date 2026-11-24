require('dotenv').config({ quiet: true });
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
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cis3339_homework1';

// Fail fast instead of queueing queries when the database is down
mongoose.set('bufferCommands', false);

async function connectToMongo() {
    try {
        await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
        // Create the collections and indexes (unique IDs, unique enrollments)
        // automatically so an empty or brand-new database works with no setup.
        for (const model of [Student, Course, Enrollment]) {
            await model.createCollection();
            await model.syncIndexes();
        }
        console.log('Connected to MongoDB and database is ready');
    } catch (err) {
        console.error(`MongoDB connection failed (${err.message}). Is MongoDB running? Retrying in 5 seconds...`);
        setTimeout(connectToMongo, 5000);
    }
}

mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected'));
connectToMongo();

// Return a clear 503 for API calls while the database is unavailable
app.use('/api', (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ error: 'Database unavailable. Make sure MongoDB is running and try again.' });
    }
    next();
});

// ---------- Helpers ----------
const clean = (value) => (typeof value === 'string' ? value.trim() : value == null ? '' : String(value).trim());
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Turn Mongoose/MongoDB errors into the right HTTP status
function handleError(res, error, duplicateMessage) {
    if (error.code === 11000) {
        return res.status(409).json({ error: duplicateMessage || 'Duplicate record' });
    }
    if (error.name === 'ValidationError') {
        const message = Object.values(error.errors).map((e) => e.message).join(', ');
        return res.status(400).json({ error: message });
    }
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
}

// ================= STUDENTS =================

// Get all students
app.get('/api/students', async (req, res) => {
    try {
        const students = await Student.find().sort({ name: 1 });
        res.json(students);
    } catch (error) {
        handleError(res, error);
    }
});

// Search for students by name (case-insensitive, partial match).
// Returns an array of matches; an empty array means nobody matched.
app.get('/api/students/search', async (req, res) => {
    try {
        const name = clean(req.query.name);
        if (!name) {
            return res.status(400).json({ error: 'Please enter a name to search for' });
        }
        const students = await Student.find({ name: new RegExp(escapeRegex(name), 'i') }).sort({ name: 1 });
        res.json(students);
    } catch (error) {
        handleError(res, error);
    }
});

// Add a student
app.post('/api/students', async (req, res) => {
    try {
        const name = clean(req.body.name);
        const studentId = clean(req.body.studentId);
        const phone = clean(req.body.phone);
        const zip = clean(req.body.zip);
        if (!name || !studentId || !phone || !zip) {
            return res.status(400).json({ error: 'All fields (name, student ID, phone, ZIP code) are required' });
        }
        const existing = await Student.findOne({ studentId });
        if (existing) {
            return res.status(409).json({ error: `A student with ID ${studentId} already exists` });
        }
        const student = await Student.create({ name, studentId, phone, zip });
        res.status(201).json(student);
    } catch (error) {
        handleError(res, error, 'A student with this ID already exists');
    }
});

// Delete a student by studentId (also removes their enrollments)
app.delete('/api/students/:studentId', async (req, res) => {
    try {
        const studentId = clean(req.params.studentId);
        const student = await Student.findOneAndDelete({ studentId });
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        const removed = await Enrollment.deleteMany({ studentId });
        res.json({ message: 'Student deleted successfully', student, enrollmentsRemoved: removed.deletedCount });
    } catch (error) {
        handleError(res, error);
    }
});

// ================= COURSES =================

// Get all courses
app.get('/api/courses', async (req, res) => {
    try {
        const courses = await Course.find().sort({ courseId: 1 });
        res.json(courses);
    } catch (error) {
        handleError(res, error);
    }
});

// Add a course
app.post('/api/courses', async (req, res) => {
    try {
        const courseId = clean(req.body.courseId);
        const courseName = clean(req.body.courseName);
        if (!courseId || !courseName) {
            return res.status(400).json({ error: 'Both course ID and course name are required' });
        }
        const existing = await Course.findOne({ courseId });
        if (existing) {
            return res.status(409).json({ error: `A course with ID ${courseId} already exists` });
        }
        const course = await Course.create({ courseId, courseName });
        res.status(201).json(course);
    } catch (error) {
        handleError(res, error, 'A course with this ID already exists');
    }
});

// Delete a course by courseId (also removes its enrollments)
app.delete('/api/courses/:courseId', async (req, res) => {
    try {
        const courseId = clean(req.params.courseId);
        const course = await Course.findOneAndDelete({ courseId });
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        const removed = await Enrollment.deleteMany({ courseId });
        res.json({ message: 'Course deleted successfully', course, enrollmentsRemoved: removed.deletedCount });
    } catch (error) {
        handleError(res, error);
    }
});

// ================= ENROLLMENTS =================

// Enroll a student in a course
app.post('/api/enrollments', async (req, res) => {
    try {
        const studentId = clean(req.body.studentId);
        const courseId = clean(req.body.courseId);
        if (!studentId || !courseId) {
            return res.status(400).json({ error: 'Please select both a student and a course' });
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
            return res.status(409).json({ error: `${student.name} is already enrolled in ${courseId}` });
        }
        const enrollment = await Enrollment.create({ studentId, courseId });
        res.status(201).json(enrollment);
    } catch (error) {
        handleError(res, error, 'This student is already enrolled in this course');
    }
});

// Get all students enrolled in a course
app.get('/api/enrollments', async (req, res) => {
    try {
        const courseId = clean(req.query.courseId);
        if (!courseId) {
            return res.status(400).json({ error: 'courseId query parameter is required' });
        }
        const course = await Course.findOne({ courseId });
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        const enrollments = await Enrollment.find({ courseId });
        const studentIds = enrollments.map((e) => e.studentId);
        const students = await Student.find({ studentId: { $in: studentIds } }).sort({ name: 1 });
        res.json(students);
    } catch (error) {
        handleError(res, error);
    }
});

// Unknown API routes return JSON 404 (not the Vue page)
app.use('/api', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
});

// ================= SERVE PRODUCTION BUILD =================
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));

// Send index.html for Vue Router routes so refreshing /courses etc. works
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'), (err) => {
        if (err) {
            res.status(500).send('Frontend not built yet. Run "npm run build" in the frontend folder.');
        }
    });
});

// Catch malformed JSON bodies and other unexpected errors
app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'Request body is not valid JSON' });
    }
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
});

// ---------- Start server ----------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
