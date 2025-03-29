const express = require('express')
const app = express();
require('dotenv').config();
app.use(express.json());
const { jwtAuth } = require('./Routes.js/jwt')
const PORT = process.env.PORT || 3000;
const UserRoute = require('./Routes.js/UserRoutes')
app.use('/User', UserRoute)
app.listen(PORT, () => {
    console.log(`Listening On The Port ${PORT}`);
})