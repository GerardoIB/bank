import { connection } from "../utils/configDb.js";
import bcrypt from 'bcrypt';
import crypto from 'crypto';
export class userModel {
    static async login({pkPhone, password}){
        try {
            const passwordDb = await connection.query(
                'SELECT password FROM tbl_users WHERE fk_Phone = ?',
                [pkPhone]
            )
            if(passwordDb[0].length === 0) return null;
            const isPasswordValid = await bcrypt.compare(password, passwordDb[0][0].password);
            if(!isPasswordValid) return null;
            const userData = await connection.query(
                'SELECT * FROM tbl_users WHERE fk_Phone = ?',
                [pkPhone]
            )
            return userData[0][0];
        } catch (error) {
            console.log(error)

        }
    }
    
   static async register({ pkPhone, name, firstName, lastName, birthdate, gender, password }) {
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
        const level = 0;
        const [resultUser] = await connection.query(
            'INSERT INTO tbl_users (pk_user, fk_Phone, password, fk_level) VALUES (?, ?, ?, ?)',
            [id, pkPhone, hashedPassword, level]
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
 
    static async getAccountDetails(fkUser,pkPhone){
        try {
            const [result] = await connection.query(
                'Select pk_account, balance from tbl_accounts where fk_user=?',
                [fkUser]
            )
            const [resultPerson] = await connection.query(
                'select * from tbl_persons where pk_phone=?',
                [pkPhone]
            )
            return {
                account:result[0],
                user: resultPerson[0]
            }
        } catch (error) {
            console.log(error)
        }
    }
}