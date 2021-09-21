// cross origin resurce sharing - CORS is a W3C standard that allows you to get
// away from the same origin policy adopted by the browsers to restrict access
// from one domain to resources belonging to another domain

const cors = require('cors');

module.exports = (app) => {
  app.use(
    cors({
      // credentials=true recive a cookie from the front (client) to know with user is in session
      credentials: true, 
      
      // supose to use origin: process.env.PUBLIC_DOMAIN but it is not working
      // origin: [process.env.PUBLIC_DOMAIN]
      origin: 'http://localhost:3000'
    })
  )
}