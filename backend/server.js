require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const session = require('express-session');
const mongoose = require('mongoose');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Database connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.error('MongoDB connection error:', err));

// Models
const Post = require('./models/Post');

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'demo-secret',
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Debug middleware
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, {
      session: req.session ? {
        id: req.sessionID,
        authenticated: req.session.authenticated,
        userId: req.session.userId
      } : 'No session'
    });
    next();
  });
}

// Serve uploads directory
app.use('/uploads', express.static('uploads'));

// Authentication Middleware - Disabled for demo
const requireAuth = (req, res, next) => next();

// Routes
app.post('/login', async (req, res) => {
  // Login logic remains but won't be used
  res.status(200).json({ success: true });
});

app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.clearCookie('sessionId');
    res.redirect('/');
  });
});

app.get('/api/check-auth', (req, res) => {
  res.status(200).end();
});

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// API Routes
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ created: -1 });
    const postsWithImageUrls = posts.map(post => ({
      ...post._doc,
      featured_image: post.featured_image_filename ? 
        `${req.protocol}://${req.get('host')}/uploads/${post.featured_image_filename}` : null
    }));
    
    res.set('Content-Type', 'application/json');
    res.json(postsWithImageUrls);
  } catch (error) {
    res.set('Content-Type', 'application/json');
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/posts/:id/image', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || !post.featured_image || !post.featured_image.data) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    res.set('Content-Type', post.featured_image.contentType);
    res.send(post.featured_image.data);
  } catch (error) {
    res.set('Content-Type', 'application/json');
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    
    const postWithImageUrl = {
      ...post._doc,
      featured_image: post.featured_image_filename ? 
        `${req.protocol}://${req.get('host')}/uploads/${post.featured_image_filename}` : null
    };
    
    res.set('Content-Type', 'application/json');
    res.json(postWithImageUrl);
  } catch (error) {
    res.set('Content-Type', 'application/json');
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/posts', upload.single('image'), async (req, res) => {
  try {
    const { announcement_header, description } = req.body;
    
    if (!announcement_header || !description) {
      res.set('Content-Type', 'application/json');
      return res.status(400).json({ error: 'Title and description are required' });
    }
    
    const newPost = new Post({
      announcement_header,
      description
    });

    if (req.file) {
      newPost.featured_image = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }
    
    await newPost.save();
    res.set('Content-Type', 'application/json');
    res.status(201).json(newPost);
  } catch (error) {
    res.set('Content-Type', 'application/json');
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/posts/:id', upload.single('image'), async (req, res) => {
  try {
    const { announcement_header, description } = req.body;
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      res.set('Content-Type', 'application/json');
      return res.status(404).json({ error: 'Post not found' });
    }

    post.announcement_header = announcement_header || post.announcement_header;
    post.description = description || post.description;
    post.updated = Date.now();

    if (req.file) {
      post.featured_image = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }
    
    await post.save();
    res.set('Content-Type', 'application/json');
    res.json(post);
  } catch (error) {
    res.set('Content-Type', 'application/json');
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/posts/:id', async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    
    if (!post) {
      res.set('Content-Type', 'application/json');
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.set('Content-Type', 'application/json');
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.set('Content-Type', 'application/json');
    res.status(500).json({ error: error.message });
  }
});

// Serve static files - MUST come after API routes
app.use(express.static(path.join(__dirname, 'public')));

// Explicit login page route
app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Root redirect
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Catch-all route for SPA
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.set('Content-Type', 'application/json');
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Admin panel: http://localhost:${PORT}/`);
  console.log(`Login page: http://localhost:${PORT}/login.html`);
});