const express = require('express');
const router = express.Router();
const User = require('../models/UserMongo');
const SolarPanel = require('../models/SolarPanelMongo');
const Recycler = require('../models/RecyclerMongo');
const { sendExpiryAlert, sendWelcomeEmail } = require('../emailService');

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
    const user = new User(req.body);
    await user.save();
    req.session.user = { id: user._id, username: user.username };
    req.session.messages = ['Registration successful!'];
    await sendWelcomeEmail(user.email, user.username);
    res.redirect('/dashboard');
  } catch (err) {
    req.session.messages = ['Registration failed: ' + err.message];
    res.redirect('/register');
  }
});

router.get('/login', (req, res) => res.render('registration/login'));
router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (user && await user.comparePassword(req.body.password)) {
      req.session.user = { id: user._id, username: user.username };
      res.redirect('/dashboard');
    } else {
      req.session.messages = ['Invalid credentials'];
      res.redirect('/login');
    }
  } catch (err) {
    req.session.messages = ['Login error'];
    res.redirect('/login');
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

router.get('/dashboard', isAuth, async (req, res) => {
  try {
    const panels = await SolarPanel.find({ user: req.session.user.id });
    const stats = {
      total_panels: panels.length,
      safe_count: panels.filter(p => p.expiryStatus() === 'safe').length,
      near_expiry_count: panels.filter(p => p.expiryStatus() === 'near_expiry').length,
      expired_count: panels.filter(p => p.expiryStatus() === 'expired').length,
      total_waste: panels.reduce((sum, p) => sum + p.estimatedWasteKg(), 0)
    };
    res.render('core/dashboard', { panels, ...stats });
  } catch (err) {
    res.render('core/dashboard', { panels: [], total_panels: 0, safe_count: 0, near_expiry_count: 0, expired_count: 0, total_waste: 0 });
  }
});

router.get('/add-panel', isAuth, (req, res) => res.render('core/add_panel'));
router.post('/add-panel', isAuth, async (req, res) => {
  try {
    const panel = new SolarPanel({ ...req.body, user: req.session.user.id });
    await panel.save();
    req.session.messages = ['Solar panel registered successfully!'];
    
    if (panel.expiryStatus() === 'near_expiry' || panel.expiryStatus() === 'expired') {
      const user = await User.findById(req.session.user.id);
      if (user) {
        await sendExpiryAlert(user.email, panel);
      }
    }
    res.redirect('/dashboard');
  } catch (err) {
    req.session.messages = ['Failed to add panel'];
    res.redirect('/add-panel');
  }
});

router.post('/delete-panel/:id', isAuth, async (req, res) => {
  try {
    await SolarPanel.findOneAndDelete({ _id: req.params.id, user: req.session.user.id });
    req.session.messages = ['Panel deleted successfully'];
  } catch (err) {
    req.session.messages = ['Failed to delete panel'];
  }
  res.redirect('/dashboard');
});

router.get('/recycler-directory', async (req, res) => {
  try {
    let query = { verified: true };
    if (req.query.location) query.location = new RegExp(req.query.location, 'i');
    if (req.query.service) query.service_type = { $in: [req.query.service, 'both'] };
    const recyclers = await Recycler.find(query);
    res.render('core/recycler_directory', { 
      recyclers, 
      location: req.query.location || '', 
      service: req.query.service || '' 
    });
  } catch (err) {
    res.render('core/recycler_directory', { recyclers: [], location: '', service: '' });
  }
});

module.exports = router;
