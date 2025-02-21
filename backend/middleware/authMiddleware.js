export const requireAdminAuth = (req, res, next) => {
    console.log("Middleware - Checking session:", req.session); // Debugging

    if (req.session?.admin) {
        return next(); // Allow access
    }
    
    return res.status(403).json({ message: "Access denied. Admin authentication required." });
};
