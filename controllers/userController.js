import jwt from 'jsonwebtoken';
import { authenticateToken } from '../utils/auth.js';
export class userController {
    constructor({userModel}){
        this.userModel = userModel;
    }
    login = async (req, res) => {
        try {
            const {pkPhone, password} = req.body;
            const userData = await this.userModel.login({pkPhone, password});
            if(!userData) return res.status(401).json({message: 'Credenciales inválidas'});
            const token = jwt.sign({pk_user: userData.pk_user, role: userData.fk_level,phone:userData.fk_phone}, process.env.JWT_SECRET, {expiresIn: '2h'});
            return  res.cookie('access_token', token, {
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
                maxAge: 2 * 60 * 60 * 1000 // 2 horas
            }).status(200).json({message: 'Inicio de sesión exitoso', user: userData});
        } catch (error) {
            res.status(500).json({message: 'Error del servidor'});
            console.log(error);
        }
    }
    register = async (req, res) => {
        try {
            const {pkPhone,name, firstName, lastName, birthdate, gender, password } = req.body;
            const result = await this.userModel.register({pkPhone,name, firstName, lastName, birthdate, gender, password });
            if(!result) return res.status(400).json({message: 'No se pudo registrar el usuario'});
            return res.status(201).json({message: 'Usuario registrado exitosamente', pk_user: result.pk_user});
        } catch (error) {
            res.status(500).json({message: 'Error del servidor'});
            console.log(error);
        }
    }

    protected = async (req, res) => {
        authenticateToken(req, res, () => {
            res.status(200).json({message: 'Acceso autorizado', user: req.user});
        });
    }
    logout = async (req, res) => {
        res.clearCookie('access_token');
        return res.status(200).json({message: 'Cierre de sesión exitoso'});
    }

   account = async (req, res) => {
    try {
        authenticateToken(req, res, async () => {
            const fkUser = req.user.pk_user;
            const pkPhone = req.user.phone;

            const details = await this.userModel.getAccountDetails(fkUser, pkPhone);

            console.log(details);

            // ✔️ IMPORTANTE: status 200, no 300
            res.status(200).json({
                account: details.account,
                user: details.user
            });
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }
};



}