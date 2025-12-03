import crypto from 'crypto'
import { connection } from '../utils/configDb.js';
export class casherModel {
    static async createTransaction({ pk_transaction, fk_account, amount, type }) {
        const conn = connection;

        try {
            // Usar el ID proporcionado por el frontend O generar uno si no viene
            const transactionId = pk_transaction || (crypto.randomBytes(2).readUInt16BE() % 10000);
            
            console.log('Creando transacción con ID:', transactionId);
            console.log('Datos recibidos:', { pk_transaction, fk_account, amount, type });
            
            await conn.beginTransaction();

            // 1. Obtener balance actual
            const [rows] = await conn.query(
                "SELECT balance FROM tbl_accounts WHERE pk_account = ? FOR UPDATE",
                [fk_account]
            );

            if (rows.length === 0) {
                await conn.rollback();
                return { success: false, message: "Cuenta no encontrada" };
            }

            let balanceActual = parseFloat(rows[0].balance);
            let nuevoBalance = balanceActual;

            // 2. Calcular balance según tipo
            if (type === "deposito") {
                nuevoBalance = balanceActual + parseFloat(amount);
            } else if (type === "retiro") {
                if (balanceActual < parseFloat(amount)) {
                    await conn.rollback();
                    return { success: false, message: "Fondos insuficientes" };
                }
                nuevoBalance = balanceActual - parseFloat(amount);
            } else {
                await conn.rollback();
                return { success: false, message: "Tipo inválido" };
            }

            console.log('Balance actual:', balanceActual);
            console.log('Nuevo balance:', nuevoBalance);
            console.log('Monto:', amount);

            // 3. Insertar la transacción
            const [insert] = await conn.query(
                `INSERT INTO tbl_transactions 
                (pk_transaction, fk_account, amount, type) 
                VALUES (?, ?, ?, ?)`,
                [transactionId, fk_account, amount, type]
            );

            if (insert.affectedRows === 0) {
                await conn.rollback();
                return { success: false, message: "No se pudo registrar la transacción." };
            }

            // 4. Actualizar la cuenta
            const [update] = await conn.query(
                "UPDATE tbl_accounts SET balance = ? WHERE pk_account = ?",
                [nuevoBalance, fk_account]
            );

            console.log('Filas actualizadas en cuenta:', update.affectedRows);

            await conn.commit();

            return {
                success: true,
                transaction_id: transactionId,
                balance_anterior: balanceActual,
                balance_nuevo: nuevoBalance,
                message: `Transacción ${type} por $${amount} registrada exitosamente`
            };

        } catch (error) {
            console.log("ERROR en createTransaction:", error);
            if (conn) await conn.rollback();
            
            // Manejar error de duplicado de ID
            if (error.code === 'ER_DUP_ENTRY') {
                return { 
                    success: false, 
                    message: `El ID de transacción ${pk_transaction} ya existe` 
                };
            }
            
            return { 
                success: false, 
                message: "Error en el servidor: " + error.message 
            };
        }
    }
    
    static async getAllTransactions(){
        try {
            const [transactions] = await connection.query(`
                SELECT t.*, a.balance, u.fk_phone as user_phone 
                FROM tbl_transactions t
                LEFT JOIN tbl_accounts a ON t.fk_account = a.pk_account
                LEFT JOIN tbl_users u ON a.fk_user = u.pk_user
                ORDER BY t.create_at DESC
            `);
            return transactions;
        } catch (error) {
            console.log("Error en getAllTransactions:", error);
            return null;
        }
    }
    
    // Método para verificar si una cuenta existe
    static async getAccountBalance(accountId) {
        try {
            const [rows] = await connection.query(
                "SELECT balance, state FROM tbl_accounts WHERE pk_account = ?",
                [accountId]
            );
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.log("Error en getAccountBalance:", error);
            return null;
        }
    }
}