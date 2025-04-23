import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    // Check Authorization header first, then fall back to cookies if present
    const authHeader = req.headers.authorization;
    let token;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
        // For backward compatibility
        token = req.cookies.token;
    }
    
    if (!token) return res.status(401).json({ success: false, message: "Unauthorized - no token provided" });
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) return res.status(401).json({ success: false, message: "Unauthorized - invalid token" });
         
        req.userId = decoded.userId;
        next();
    } catch (error) {
        console.log("Error in verifyToken ", error);
        return res.status(401).json({ success: false, message: "Server error" });
    }
};
