const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const app = express();
app.use(express.json());

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  id: { type: String, required: true, trim: true, unique: true },
  phone: { type: String, required: true, trim: true },
  zip: { type: String, required: true, trim: true }
});
const courseSchema = new mongoose.Schema({
  id: { type: String, required: true, trim: true, unique: true },
  name: { type: String, required: true, trim: true }
});
const enrollmentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true }
});
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

const Student = mongoose.model('Student', studentSchema);
const Course = mongoose.model('Course', courseSchema);
const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

function required(body, fields) {
  return body && fields.every((field) => typeof body[field] === 'string' && body[field].trim());
}
function validId(id) {
  return mongoose.isValidObjectId(id);
}
function sendError(res, error) {
  if (error.code === 11000) return res.status(409).json({ error: 'That ID or enrollment already exists.' });
  if (error.name === 'ValidationError' || error.name === 'CastError') return res.status(400).json({ error: error.message });
  console.error(error);
  return res.status(500).json({ error: 'Database request failed. Check that MongoDB is running.' });
}
function escapeRegex(value) {
  return value.replace(/[.*+?^\$\{\}()|[\]\\]/g, '\\$&');
}

app.get('/api/students', async (req, res) => {
  try {
    const filter = req.query.name ? { name: { $regex: escapeRegex(String(req.query.name)), $options: 'i' } } : {};
    res.json(await Student.find(filter).sort({ name: 1, id: 1 }));
  } catch (error) { sendError(res, error); }
});
app.post('/api/students', async (req, res) => {
  if (!required(req.body, ['name', 'id', 'phone', 'zip'])) return res.status(400).json({ error: 'All student fields are required.' });
  try { res.status(201).json(await Student.create(req.body)); }
  catch (error) { sendError(res, error); }
});
app.delete('/api/students/:id', async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ error: 'Invalid student ID.' });
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found.' });
    await Enrollment.deleteMany({ student: student._id });
    res.json({ message: 'Student and their enrollments deleted.' });
  } catch (error) { sendError(res, error); }
});
app.get('/api/courses', async (req, res) => {
  try { res.json(await Course.find().sort({ id: 1 })); }
  catch (error) { sendError(res, error); }
});
app.post('/api/courses', async (req, res) => {
  if (!required(req.body, ['id', 'name'])) return res.status(400).json({ error: 'Course ID and name are required.' });
  try { res.status(201).json(await Course.create(req.body)); }
  catch (error) { sendError(res, error); }
});
app.delete('/api/courses/:id', async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ error: 'Invalid course ID.' });
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found.' });
    await Enrollment.deleteMany({ course: course._id });
    res.json({ message: 'Course and its enrollments deleted.' });
  } catch (error) { sendError(res, error); }
});
app.post('/api/enrollments', async (req, res) => {
  const { student, course } = req.body || {};
  if (!validId(student) || !validId(course)) return res.status(400).json({ error: 'Select a student and a course.' });
  try {
    const [existingStudent, existingCourse] = await Promise.all([Student.findById(student), Course.findById(course)]);
    if (!existingStudent || !existingCourse) return res.status(404).json({ error: 'Student or course not found.' });
    res.status(201).json(await Enrollment.create({ student, course }));
  } catch (error) { sendError(res, error); }
});
app.get('/api/courses/:id/students', async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ error: 'Invalid course ID.' });
  try {
    if (!await Course.exists({ _id: req.params.id })) return res.status(404).json({ error: 'Course not found.' });
    const enrollments = await Enrollment.find({ course: req.params.id }).populate('student');
    res.json(enrollments.filter((item) => item.student).map((item) => item.student).sort((a, b) => a.name.localeCompare(b.name)));
  } catch (error) { sendError(res, error); }
});

const dist = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(dist));
app.get(/.*/, (req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'API route not found.' });
  res.sendFile(path.join(dist, 'index.html'));
});

const port = process.env.PORT || 3000;
async function start() {
  try {
    if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is missing from .env');
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    await Promise.all([Student.init(), Course.init(), Enrollment.init()]);
    app.listen(port, () => console.log(`Open http://localhost:${port}`));
  } catch (error) {
    console.error('Could not start: MongoDB connection or index setup failed.', error.message);
    process.exitCode = 1;
  }
}
start();
