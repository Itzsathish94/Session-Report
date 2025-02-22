export const requireAdminAuth = (req, res, next) => {
    if (req.session?.admin) {
        return next(); 
    }
    return res.status(403).json({ message: "Access denied. Admin authentication required." });
};
