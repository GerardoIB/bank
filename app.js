import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import dotenv from "dotenv";
import { userRoutes } from "./routes/user.js";
import { casherRoutes } from "./routes/casher.js";
import { userModel } from "./models/userModel.js";
import { casherModel } from "./models/casherModel.js";
import { corsMiddleware } from "./middelwares/cors.js";
import { adminRoutes } from "./routes/admin.js";
import { adminModel } from "./models/adminModel.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(corsMiddleware)
app.use(cookieParser())
app.use(express.json())
app.use('/user', userRoutes({ userModel }));
app.use('/cashier', casherRoutes({ casherModel }));
app.use('/admin',adminRoutes({adminModel}))

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "dist")));

app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});