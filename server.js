const express = require('express');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

const PORT = process.env.PORT;

const server = app.listen(
  PORT, 
  console.log(`Server running on port ${PORT}`)
  );