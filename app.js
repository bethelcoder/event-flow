require('dotenv').config();
const express = require('express');
const passport = require('passport');
const path = require('path');

require('./backend/config/db.js');
require('./backend/config/passport');

const sessionMiddleware = require('./backend/config/session');
const authRoutes = require('./backend/routes/auth');
const indexRoutes = require('./backend/routes/index');

const app = express();

app.use(sessionMiddleware);

app.set('view engine', 'ejs');
app.set('views', 'frontend/views');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use('/styles', express.static(path.join(__dirname, 'frontend/styles')))
app.use('/auth', authRoutes);
app.use('/', indexRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
