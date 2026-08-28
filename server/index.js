import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Route Imports
import authRoutes from './routes/auth.js';
import inventoryRoutes from './routes/inventory.js';
import sosRoutes from './routes/sos.js';
import campsRoutes from './routes/camps.js';
import predictRoutes from './routes/predict.js';
import chatRoutes from './routes/chat.js';

dotenv.config();

// Connect to Database
connectDB();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Set socket.io instance to be accessible in routes/controllers
app.set('io', io);

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/camps', campsRoutes);
app.use('/api/predict', predictRoutes);
app.use('/api/chat', chatRoutes);

// Socket.io Real-time connection
io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);

  socket.on('track_donor', (data) => {
    // Broadcast the donor's live location to all other clients
    socket.broadcast.emit('donor_location_update', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;


httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
