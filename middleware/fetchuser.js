const jwt = require('jsonwebtoken');
const JWT_SECRET = "HelloEveryone$20";

const fetchuser = (req, res, next) =>{
    // Get the user from the jwt token and add it to the req object

    const token = req.header('auth-token');
    // If the token is not valid
    if(!token){
        res.status(401).json({error: "Please authenticate using the valid token"});
    }
    try {
        
        // Verify our token with the JWT_Secret code.
        const data = jwt.verify(token, JWT_SECRET);

        // Initialising the request with the data.user
        req.user = data.user;
        next();
        
    } catch (error) {
        res.status(401).json({error: "Please authenticate using the valid token"});

    }
}

module.exports = fetchuser;