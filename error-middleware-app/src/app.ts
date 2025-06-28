import express from 'express';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Define your routes here
// Example: app.get('/api/example', (req, res) => { ... });

// Centralized error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});