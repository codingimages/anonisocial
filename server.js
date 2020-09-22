const express = require('express');

//require db connection
const connectDB = require('./config/db');

const app = express();

// connect database
connectDB();

// init middleware
app.use(express.json({ extended: false }));

app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/profile', require('./routes/api/profiles'));
app.use('/api/users', require('./routes/api/users'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
