// server.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const session = require('express-session');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'a-very-strong-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' } // Use secure cookies in production
}));

// --- Authentication Middleware ---
const checkAuth = (req, res, next) => {
  if (req.session.isAuthenticated) {
    next();
  } else {
    res.redirect('/login');
  }
};

// --- Routes ---

// Login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Login action
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password';

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    req.session.isAuthenticated = true;
    res.redirect('/admin');
  } else {
    // Optional: Add an error message to the login page
    res.redirect('/login?error=1');
  }
});

// Logout action
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.redirect('/admin');
    }
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
});

// Protected Admin Route
app.use('/admin', checkAuth, express.static(path.join(__dirname, '../frontend/dist')));

app.get('/admin/*', checkAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});


// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Simple in-memory storage (replace with a database in production)
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
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// API Routes (Protected by Basic Auth)

// Get all posts (for your frontend)
app.get('/api/posts', (req, res) => {
  const postsWithImageUrls = posts.map(post => ({
    ...post,
    featured_image: post.featured_image_filename ? `${req.protocol}://${req.get('host')}/uploads/${post.featured_image_filename}` : null
  }));
  
  // Sort by created date (newest first)
  postsWithImageUrls.sort((a, b) => new Date(b.created) - new Date(a.created));
  
  res.json(postsWithImageUrls);
});

// Get single post
app.get('/api/posts/:id', (req, res) => {
  const post = posts.find(p => p.id === req.params.id);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }
  
  const postWithImageUrl = {
    ...post,
    featured_image: post.featured_image_filename ? `${req.protocol}://${req.get('host')}/uploads/${post.featured_image_filename}` : null
  };
  
  res.json(postWithImageUrl);
});

// Create new post
app.post('/api/posts', checkAuth, upload.single('image'), (req, res) => {
  try {
    console.log('CREATE request received');
    console.log('Request body:', req.body);
    console.log('File uploaded:', req.file ? req.file.filename : 'No file');
    
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
    console.error('Error in POST route:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update post
app.put('/api/posts/:id', checkAuth, upload.single('image'), (req, res) => {
  try {
    const postIndex = posts.findIndex(p => p.id === req.params.id);
    if (postIndex === -1) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const { announcement_header, description } = req.body;
    const existingPost = posts[postIndex];
    
    // Delete old image if new one is uploaded
    if (req.file && existingPost.featured_image_filename) {
        const oldImagePath = path.join('uploads', existingPost.featured_image_filename);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
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

// Delete post
app.delete('/api/posts/:id', checkAuth, (req, res) => {
  try {
    const postIndex = posts.findIndex(p => p.id === req.params.id);
    if (postIndex === -1) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const post = posts[postIndex];
    
    // Delete associated image
    if (post.featured_image_filename) {
      const imagePath = path.join('uploads', post.featured_image_filename);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
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
  console.log(`Admin panel available at http://localhost:${PORT}/admin`);
  console.log(`API endpoint: http://localhost:${PORT}/api/posts`);
});