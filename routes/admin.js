import { Router } from "express";
import { adminController } from "../controllers/adminController.js";
export const adminRoutes = ({adminModel}) => {
    const router = Router()

    const controller = new adminController({adminModel})

    router.get('/users', controller.getAllUser)
    router.post('/users',controller.createUsers)

    return router

}