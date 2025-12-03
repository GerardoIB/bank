import { connection } from '../utils/configDb.js'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
export class adminModel {
    static async getAllUser() {
        try {
            const [result] = await connection.query(`
                SELECT 
    u.pk_user AS user_id,
    u.fk_level AS fk_level,
    p.person AS nombre_usuario,
    p.first_name AS nombre,
    p.last_name AS apellido,
    p.gender AS gender,
    p.pk_phone AS telefono,
    a.pk_account AS cuenta_id,
    a.state AS estado_cuenta,
    a.balance AS saldo,
    a.create_at AS fecha_creacion_cuenta
FROM 
    tbl_users u
JOIN 
    tbl_persons p ON u.fk_phone = p.pk_phone
LEFT JOIN 
    tbl_accounts a ON u.pk_user = a.fk_user
ORDER BY 
    u.pk_user;
            `)
            return result
        } catch (error) {
            console.error(error)
        }
    }

     static async register({ pkPhone, name, firstName, lastName, birthdate, gender, password, fkLevel }) {
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
    
            // ID usuario (2 bytes = 0–65535)
            const id = crypto.randomBytes(2).readUInt16BE() % 10000;
    
            // Registrar persona
            const [resultPerson] = await connection.query(
                'INSERT INTO tbl_persons (pk_Phone, person, first_name, last_name, birthday, gender) VALUES (?, ?, ?, ?, ?, ?)',
                [pkPhone, name, firstName, lastName, birthdate, gender]
            );
            if (resultPerson.affectedRows === 0) return null;
    
            // Registrar usuario
            
            const [resultUser] = await connection.query(
                'INSERT INTO tbl_users (pk_user, fk_Phone, password, fk_level) VALUES (?, ?, ?, ?)',
                [id, pkPhone, hashedPassword, fkLevel]
            );
            if (resultUser.affectedRows === 0) return null;
    
            // ID cuenta (3 bytes correctos)
            const idAcount = crypto.randomBytes(3).readUIntBE(0, 3) % 1000000;
    
            // Registrar cuenta
            const [resultAccount] = await connection.query(
                'INSERT INTO tbl_accounts (pk_account, fk_user, state, balance) VALUES (?, ?, ?, ?)',
                [idAcount, id, 'active', 0]
            );
            if (resultAccount.affectedRows === 0) return null;
    
            return {
                pk_user: id
            };
        } catch (error) {
            console.log(error);
            return null;
        }
    }
}