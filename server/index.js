require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorHandler');
const eventRoutes = require('./routes/eventRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const path = require('path');

__dirname = path.resolve();
const clientBuildPath = path.join(__dirname, '../client/dist');

const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: [
    'http://localhost:5173',               // local dev frontend
    'https://quickqrticket.onrender.com'   // deployed frontend
  ],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(clientBuildPath));

app.use('/api/auth', authRoutes); 
app.use('/api/events', eventRoutes);
app.use('/api/tickets', ticketRoutes);


app.get('/api', (req, res) => {
  res.status(200).json({ message: 'QuickTicket API is running!' });
});

app.get('/{*any}', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



