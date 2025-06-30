require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');

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
const User = require('./models/User');
const Post = require('./models/Post');

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration with MongoDB Atlas store
// Simplified session configuration for development
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Debug middleware (remove in production)
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

// Authentication Middleware
const requireAuth = (req, res, next) => {
  if (req.session && req.session.authenticated) {
    return next();
  }
  
  if (req.path.startsWith('/api/')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  res.redirect('/login.html');
};

// Routes
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    req.session.userId = user._id;
    req.session.authenticated = true;
    
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ error: 'Failed to save session' });
      }
      
      console.log('Login successful:', {
        sessionId: req.sessionID,
        userId: user._id
      });
      
      res.json({ success: true, redirect: '/' });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.clearCookie('sessionId');
    res.redirect('/login.html');
  });
});

app.get('/api/check-auth', (req, res) => {
  if (req.session.authenticated) {
    res.status(200).end();
  } else {
    res.status(401).end();
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Explicit login page route
app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Protected admin routes
app.get('/', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/*', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Root redirect
app.get('/', (req, res) => {
  if (req.session?.authenticated) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    res.redirect('/login.html');
  }
});

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Configure multer for file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/');
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, uniqueSuffix + path.extname(file.originalname));
//   }
// });

const upload = multer({
  storage: multer.memoryStorage(), // Store file in memory as Buffer
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
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

// Protect API routes
app.use('/api', requireAuth);

// API Routes
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ created: -1 });
    const postsWithImageUrls = posts.map(post => ({
      ...post._doc,
      featured_image: post.featured_image_filename ? 
        `${req.protocol}://${req.get('host')}/uploads/${post.featured_image_filename}` : null
    }));
    res.json(postsWithImageUrls);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get image by post ID
app.get('/api/posts/:id/image', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || !post.featured_image || !post.featured_image.data) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    res.set('Content-Type', post.featured_image.contentType);
    res.send(post.featured_image.data);
  } catch (error) {
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
    
    res.json(postWithImageUrl);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new post
app.post('/api/posts', upload.single('image'), async (req, res) => {
  try {
    const { announcement_header, description } = req.body;
    
    if (!announcement_header || !description) {
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
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update post
app.put('/api/posts/:id', upload.single('image'), async (req, res) => {
  try {
    const { announcement_header, description } = req.body;
    const post = await Post.findById(req.params.id);
    
    if (!post) {
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
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/posts/:id', async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    if (post.featured_image_filename) {
      const imagePath = path.join('uploads', post.featured_image_filename);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Admin panel: http://localhost:${PORT}/`);
  console.log(`Login page: http://localhost:${PORT}/login.html`);
  
  // Create initial admin user if not exists
  createAdminUser();
});

// Helper function to create initial admin user
// async function createAdminUser() {
//   try {
//     const existingAdmin = await User.findOne({ username: 'admin' });
//     if (!existingAdmin) {
//       const hashedPassword = await bcrypt.hash('admin11', 10);
//       const admin = new User({
//         username: 'admin',
//         password: hashedPassword
//       });
//       await admin.save();
//       console.log('Admin user created successfully');
//     }
//   } catch (error) {
//     console.error('Error creating admin user:', error);
//   }
// }