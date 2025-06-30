const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const session = require('express-session');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3001;

require('dotenv').config();

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use('/uploads', express.static('uploads'));

// Simple user database
const users = [
  {
    id: 1,
    username: 'admin',
    password: '$2b$10$2OQXQXgk/iMwQZIbvJH.KeJn/2OjPZHvG9RKJy9Z0xyfpLUEgKvj6' // admin123
  }
];

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  const user = users.find(u => u.username === username);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  bcrypt.compare(password, user.password, (err, result) => {
    if (err || !result) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    req.session.userId = user.id;
    req.session.authenticated = true;
    
    res.json({ success: true, redirect: '/admin' });
  });
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    res.redirect('/login.html');
  });
});

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (req.session && req.session.authenticated) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
};

// Auth check endpoint
app.get('/api/check-auth', (req, res) => {
  if (req.session.authenticated) {
    res.status(200).end();
  } else {
    res.status(401).end();
  }
});

// Serve login page
app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Admin Route
app.use('/admin', requireAuth, express.static(path.join(__dirname, 'public'), {
  maxAge: '1y',
  immutable: true,
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
    res.setHeader('X-Frame-Options', 'DENY');
  }
}));

app.use('/assets', requireAuth, express.static(path.join(__dirname, 'public/assets'), {
  maxAge: '1y',
  immutable: true
}));

app.get('/admin/*', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Simple in-memory storage
let posts = [
  {
    id: '1',
    announcement_header: 'Welcome to SIGA',
    description: 'This is a sample announcement for the SIGA website.',
    featured_image_filename: 'image1.jpg',
    created: new Date().toISOString(),
    updated: new Date().toISOString()
  }
];

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Protect API routes
app.use('/api', requireAuth);

// API Routes
app.get('/api/posts', (req, res) => {
  const postsWithImageUrls = posts.map(post => ({
    ...post,
    featured_image: post.featured_image_filename ? `${req.protocol}://${req.get('host')}/uploads/${post.featured_image_filename}` : null
  }));
  
  postsWithImageUrls.sort((a, b) => new Date(b.created) - new Date(a.created));
  res.json(postsWithImageUrls);
});

app.get('/api/posts/:id', (req, res) => {
  const post = posts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  
  const postWithImageUrl = {
    ...post,
    featured_image: post.featured_image_filename ? `${req.protocol}://${req.get('host')}/uploads/${post.featured_image_filename}` : null
  };
  
  res.json(postWithImageUrl);
});

app.post('/api/posts', upload.single('image'), (req, res) => {
  try {
    const { announcement_header, description } = req.body;
    
    if (!announcement_header || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }
    
    const newPost = {
      id: Date.now().toString(),
      announcement_header,
      description,
      featured_image_filename: req.file ? req.file.filename : null,
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    };
    
    posts.push(newPost);
    
    const postWithImageUrl = {
      ...newPost,
      featured_image: newPost.featured_image_filename ? `${req.protocol}://${req.get('host')}/uploads/${newPost.featured_image_filename}` : null
    };
    
    res.status(201).json(postWithImageUrl);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.put('/api/posts/:id', upload.single('image'), (req, res) => {
  try {
    const postIndex = posts.findIndex(p => p.id === req.params.id);
    if (postIndex === -1) return res.status(404).json({ error: 'Post not found' });
    
    const { announcement_header, description } = req.body;
    const existingPost = posts[postIndex];
    
    if (req.file && existingPost.featured_image_filename) {
      const oldImagePath = path.join('uploads', existingPost.featured_image_filename);
      if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
    }
    
    const updatedPost = {
      ...existingPost,
      announcement_header: announcement_header || existingPost.announcement_header,
      description: description || existingPost.description,
      featured_image_filename: req.file ? req.file.filename : existingPost.featured_image_filename,
      updated: new Date().toISOString()
    };
    
    posts[postIndex] = updatedPost;
    
    const postWithImageUrl = {
      ...updatedPost,
      featured_image: updatedPost.featured_image_filename ? `${req.protocol}://${req.get('host')}/uploads/${updatedPost.featured_image_filename}` : null
    };
    
    res.json(postWithImageUrl);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/posts/:id', (req, res) => {
  try {
    const postIndex = posts.findIndex(p => p.id === req.params.id);
    if (postIndex === -1) return res.status(404).json({ error: 'Post not found' });
    
    const post = posts[postIndex];
    
    if (post.featured_image_filename) {
      const imagePath = path.join('uploads', post.featured_image_filename);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }
    
    posts.splice(postIndex, 1);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Admin panel: http://localhost:${PORT}/admin`);
  console.log(`Login page: http://localhost:${PORT}/login.html`);
});