import { Router } from "express";
import { userController } from "../controllers/userController.js";
export const userRoutes = ({userModel}) => {
    const router = Router();
    const controller = new userController({ userModel});
    router.post('/login', controller.login);
    router.post('/register', controller.register);
    router.get('/protected', controller.protected);
    router.post('/logout', controller.logout);
    router.get('/account',controller.account)
    return router;
}