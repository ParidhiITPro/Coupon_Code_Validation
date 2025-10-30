const express = require('express');
const dotenv = require('dotenv').config();
const connectDB = require('./config/db')
const couponRoutes = require('./routes/couponRoutes')
const cors = require('cors')


const app =  express();
app.use(cors());
app.use(express.json())

connectDB();

app.use('/api/coupons', couponRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>{console.log(`The server running on port ${PORT}`)})