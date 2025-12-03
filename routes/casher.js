import { Router } from "express";
import { casherController } from "../controllers/casherController.js";

export const casherRoutes = ({ casherModel }) => {
    const router = Router();
    const controller = new casherController({ casherModel }); // ✅ Pasa casherModel
    
    router.post("/transaction", (req, res) => {
        controller.createTransaction(req, res);
    });
    
    router.get("/transactions", (req, res) => {
        controller.getTransactions(req, res);
    });
    
    return router;
};