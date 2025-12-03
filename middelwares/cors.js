import cors from 'cors';

const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://upa-cafe.vercel.app'  // SIN barra al final
];

const corsOptions = {
    origin: function (origin, callback) {
        // Permitir requests sin origin (como mobile apps, curl, Postman)
        if (!origin) {
            return callback(null, true);
        }
        
        // Verificar si el origin está en la lista permitida
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        
        // Rechazar otros origins
        const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
        return callback(new Error(msg), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH','OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

export const corsMiddleware = cors(corsOptions);