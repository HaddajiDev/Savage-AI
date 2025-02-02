require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');


const app = express();
const port = 5000;

const connect = require('./connectdb');
connect();

app.use(cors({
  origin: [process.env.FRONT_URL, process.env.BACKEND],
  credentials: true
}));

app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

app.use('/api', require('./routes/chat'));
app.use('/user', require('./routes/user'));

app.get("/", (req, res) => res.send("Working"));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});