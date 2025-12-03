import jwt from 'jsonwebtoken';
import { authenticateToken } from '../utils/auth.js';
export class casherController {
    constructor({casherModel}){
        this.casherModel = casherModel;
    }
    createTransaction = async (req, res) => {
        try {
            const { pk_transaction, fk_account, amount, type } = req.body;
            authenticateToken(req, res, async () => {
                const result = await this.casherModel.createTransaction({ pk_transaction, fk_account, amount, type });
                if (!result.success) {
                    return res.status(400).json({ message: result.message });
                }
                return res.status(201).json({ message: 'Transacción realizada exitosamente', transaction: result.transaction });
            });
        } catch (error) {
            res.status(500).json({message: 'Error del servidor'});
            console.log(error);
        }
    }
    getTransactions = async (req, res) => {
        try{
            authenticateToken(req, res, async () => {
                const transactions = await this.casherModel.getAllTransactions();
                if(!transactions) return res.status(404).json({message: 'No se encontraron transacciones'});
                return res.status(200).json({transactions});
            })
        }catch(error){
            res.status(500).json({message: 'Error del servidor'});
            console.log(error);
        }
    }
}