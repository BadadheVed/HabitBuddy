const express = require('express')
const app = express();
require('dotenv').config();
const { jwtAuth } = require('./Routes.js/jwt')
const PORT = process.env.PORT || 3000;
const UserRoute = require('./Routes.js/UserRoutes')
const cors = require('cors')
const corsOptions = {
    origin: 'http://localhost:5173',  // Allow only requests from this frontend origin
    credentials: true,  // Allow credentials (cookies, Authorization headers)
};
app.use(cors(corsOptions));
app.use(express.json());
app.use('/User', UserRoute)
app.listen(PORT, () => {
    console.log(`Listening On The Port ${PORT}`);
})