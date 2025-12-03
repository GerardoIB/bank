import jwt from 'jsonwebtoken';
export function authenticateToken(req, res, next) {
    const {access_token} = req.cookies;
    if (!access_token) {
        return res.status(401).json({ message: 'Acceso no autorizado' });
    }

    try {
        const decoded = jwt.verify(access_token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Token inválido' });
    }

}