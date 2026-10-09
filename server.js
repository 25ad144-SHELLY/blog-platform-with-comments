require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err.message));

// ---------- Models ----------
const { Schema, model } = mongoose;
const User = model('User', new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true }
}, { timestamps: true }));

const Post = model('Post', new Schema({
  title: { type: String, required: true, trim: true },
  body: { type: String, required: true, trim: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true }));

const Comment = model('Comment', new Schema({
  post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true, trim: true }
}, { timestamps: true }));

// ---------- Helpers ----------
const h = fn => (req, res, next) => fn(req, res, next).catch(next);
const sign = u => jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const userOut = u => ({ id: u._id, name: u.name, email: u.email });

const auth = (req, res, next) => {
  const t = (req.headers.authorization || '').replace('Bearer ', '');
  try {
    req.userId = jwt.verify(t, process.env.JWT_SECRET).id;
    next();
  } catch (e) {
    res.status(401).json({ error: 'Login required.' });
  }
};

// ---------- Auth routes ----------
app.post('/api/auth/register', h(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password || password.length < 6)
    return res.status(400).json({ error: 'Name, email and a 6+ character password are required.' });
  if (await User.findOne({ email: email.toLowerCase() }))
    return res.status(400).json({ error: 'Email already registered.' });
  const user = await User.create({ name, email, password: await bcrypt.hash(password, 10) });
  res.status(201).json({ token: sign(user), user: userOut(user) });
}));

app.post('/api/auth/login', h(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: (email || '').toLowerCase() });
  if (!user || !(await bcrypt.compare(password || '', user.password)))
    return res.status(400).json({ error: 'Invalid email or password.' });
  res.json({ token: sign(user), user: userOut(user) });
}));

app.get('/api/auth/me', auth, h(async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(401).json({ error: 'User not found.' });
  res.json(userOut(user));
}));

// ---------- Post routes ----------
app.get('/api/posts', h(async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 }).populate('author', 'name').lean();
  for (const p of posts) p.commentCount = await Comment.countDocuments({ post: p._id });
  res.json(posts);
}));

app.get('/api/posts/:id', h(async (req, res) => {
  const post = await Post.findById(req.params.id).populate('author', 'name');
  if (!post) return res.status(404).json({ error: 'Post not found.' });
  res.json(post);
}));

app.post('/api/posts', auth, h(async (req, res) => {
  const { title, body } = req.body;
  if (!title || !body) return res.status(400).json({ error: 'Title and content are required.' });
  const post = await Post.create({ title, body, author: req.userId });
  res.status(201).json(post);
}));

app.put('/api/posts/:id', auth, h(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found.' });
  if (String(post.author) !== req.userId) return res.status(403).json({ error: 'Not allowed.' });
  const { title, body } = req.body;
  if (!title || !body) return res.status(400).json({ error: 'Title and content are required.' });
  post.title = title; post.body = body;
  await post.save();
  res.json(post);
}));

app.delete('/api/posts/:id', auth, h(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found.' });
  if (String(post.author) !== req.userId) return res.status(403).json({ error: 'Not allowed.' });
  await Comment.deleteMany({ post: post._id });
  await post.deleteOne();
  res.json({ message: 'Deleted' });
}));

// ---------- Comment routes ----------
app.get('/api/posts/:id/comments', h(async (req, res) => {
  const comments = await Comment.find({ post: req.params.id }).sort({ createdAt: 1 }).populate('author', 'name');
  res.json(comments);
}));

app.post('/api/posts/:id/comments', auth, h(async (req, res) => {
  if (!req.body.text || !req.body.text.trim()) return res.status(400).json({ error: 'Comment is empty.' });
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found.' });
  const c = await Comment.create({ post: post._id, author: req.userId, text: req.body.text });
  res.status(201).json(c);
}));

app.delete('/api/comments/:id', auth, h(async (req, res) => {
  const c = await Comment.findById(req.params.id);
  if (!c) return res.status(404).json({ error: 'Comment not found.' });
  if (String(c.author) !== req.userId) return res.status(403).json({ error: 'Not allowed.' });
  await c.deleteOne();
  res.json({ message: 'Deleted' });
}));

app.get('/', (req, res) => res.send('Blog API running'));

// ---------- Error handler ----------
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(err.name === 'CastError' ? 400 : 500).json({ error: err.name === 'CastError' ? 'Invalid id.' : 'Server error.' });
});

app.listen(process.env.PORT || 5000, () => console.log('Server running'));
