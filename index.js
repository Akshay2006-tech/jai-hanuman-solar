const express = require('express');
const router = express.Router();
const User = require('../models/User');
const SolarPanel = require('../models/SolarPanel');
const Recycler = require('../models/Recycler');
const { sendExpiryAlert, sendWelcomeEmail, sendBatchExpiryAlert } = require('../emailService');

const isAuth = (req, res, next) => {
  if (req.session.user) return next();
  res.redirect('/login');
};

router.get('/', (req, res) => res.render('core/home'));
router.get('/about', (req, res) => res.render('core/about'));
router.get('/how-it-works', (req, res) => res.render('core/how_it_works'));
router.get('/contact', (req, res) => res.render('core/contact'));
router.get('/recycling-guide', (req, res) => res.render('core/recycling_guide'));

router.get('/register', (req, res) => res.render('registration/register'));
router.post('/register', async (req, res) => {
  try {
    const user = await User.create(req.body);
    req.session.user = { id: user.id, username: user.username };
    req.session.messages = ['Registration successful!'];
    
    // Send welcome email
    await sendWelcomeEmail(user.email, user.username);
    
    res.redirect('/dashboard');
  } catch (err) {
    req.session.messages = ['Registration failed'];
    res.redirect('/register');
  }
});

router.get('/login', (req, res) => res.render('registration/login'));
router.post('/login', async (req, res) => {
  const user = User.findOne({ username: req.body.username });
  if (user && await User.comparePassword(req.body.password, user.password)) {
    req.session.user = { id: user.id, username: user.username };
    res.redirect('/dashboard');
  } else {
    req.session.messages = ['Invalid credentials'];
    res.redirect('/login');
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

router.get('/dashboard', isAuth, (req, res) => {
  const panels = SolarPanel.find({ user: req.session.user.id });
  const stats = {
    total_panels: panels.length,
    safe_count: panels.filter(p => p.expiryStatus() === 'safe').length,
    near_expiry_count: panels.filter(p => p.expiryStatus() === 'near_expiry').length,
    expired_count: panels.filter(p => p.expiryStatus() === 'expired').length,
    total_waste: panels.reduce((sum, p) => sum + p.estimatedWasteKg(), 0)
  };
  res.render('core/dashboard', { panels, ...stats });
});

router.get('/add-panel', isAuth, (req, res) => res.render('core/add_panel'));
router.post('/add-panel', isAuth, async (req, res) => {
  const panel = SolarPanel.create({ ...req.body, user: req.session.user.id });
  req.session.messages = ['Solar panel registered successfully!'];
  
  // Check if panel is near expiry or expired and send alert
  if (panel.expiryStatus() === 'near_expiry' || panel.expiryStatus() === 'expired') {
    const user = User.findOne({ id: req.session.user.id });
    if (user) {
      await sendExpiryAlert(user.email, panel);
      req.session.messages.push('Expiry alert sent to your email!');
    }
  }
  
  res.redirect('/dashboard');
});

router.post('/delete-panel/:id', isAuth, (req, res) => {
  SolarPanel.findOneAndDelete({ id: req.params.id, user: req.session.user.id });
  req.session.messages = ['Panel deleted successfully'];
  res.redirect('/dashboard');
});

router.get('/recycler-directory', (req, res) => {
  const query = {};
  if (req.query.location) query.location = req.query.location;
  if (req.query.service) query.service_type = req.query.service;
  const recyclers = Recycler.find(query);
  res.render('core/recycler_directory', { 
    recyclers, 
    location: req.query.location || '', 
    service: req.query.service || '' 
  });
});

module.exports = router;
