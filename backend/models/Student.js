const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    studentId: { type: String, required: true, unique: true, trim: true },
    phone: { type: String, required: true, trim: true },
    zip: { type: String, required: true, trim: true }
});

module.exports = mongoose.model('Student', studentSchema);
