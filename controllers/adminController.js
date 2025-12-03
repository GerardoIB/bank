import { authenticateToken } from "../utils/auth.js"
export class adminController{
    constructor({adminModel}){
        this.adminModel = adminModel
    }
    getAllUser = async (req, res) => {
        try {
            
                const users = await this.adminModel.getAllUser()
                res.status(200).json(users)
            
        } catch (error) {
            res.status(500).json({message:"Algo ha salido mal"})
            console.log(error)
        }
    }
   createUsers = async (req, res) => {
    try {
        const { 
            nombre, 
            nombre_usuario, 
            apellido, 
            telefono, 
            birthday, 
            password, 
            gender,
            fk_level 
        } = req.body;

        console.log('Datos recibidos:', req.body); // Para debug

        // Validaciones básicas
        if (!telefono || !password || !nombre_usuario) {
            return res.status(400).json({ 
                success: false, 
                message: 'Teléfono, contraseña y nombre de usuario son requeridos' 
            });
        }

        if (!/^\d{10}$/.test(telefono)) {
            return res.status(400).json({ 
                success: false, 
                message: 'El teléfono debe tener 10 dígitos' 
            });
        }

        if (password.length < 4) {
            return res.status(400).json({ 
                success: false, 
                message: 'La contraseña debe tener al menos 4 caracteres' 
            });
        }

        // Validar fecha de nacimiento (mayor de 18 años)
        if (birthday) {
            const birthDate = new Date(birthday);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            
            if (age < 18) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'El usuario debe ser mayor de 18 años' 
                });
            }
        }

        // Validar género (M o F)
        if (gender && !['M', 'F'].includes(gender)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Género debe ser M (Masculino) o F (Femenino)' 
            });
        }

        // Validar nivel de usuario (0, 1, 2)
        const validLevels = [0, 1, 2];
        if (fk_level !== undefined && !validLevels.includes(parseInt(fk_level))) {
            return res.status(400).json({ 
                success: false, 
                message: 'Nivel de usuario inválido. Use: 0=Usuario, 1=Admin, 2=Cajero' 
            });
        }

        // Preparar datos EN EL FORMATO QUE ESPERA EL MODELO
        const userData = {
            pkPhone: telefono, // El modelo espera pkPhone, no telefono
            name: nombre_usuario, // El modelo espera name para el campo 'person'
            firstName: nombre || '', // El modelo espera firstName
            lastName: apellido || '', // El modelo espera lastName
            birthdate: birthday || null, // El modelo espera birthdate, no birthday
            gender: gender || 'M',
            password: password,
            fkLevel: fk_level !== undefined ? parseInt(fk_level) : 0 // El modelo espera fkLevel
        };

        console.log('Datos enviados al modelo:', userData); // Para debug

        // Llamar al modelo para registrar el usuario
        const result = await this.adminModel.register(userData);

        if (!result) { // El modelo retorna null si hay error
            return res.status(400).json({ 
                success: false, 
                message: 'Error al crear el usuario (el modelo retornó null)' 
            });
        }

        // Respuesta exitosa
        return res.status(201).json({
            success: true,
            message: 'Usuario creado exitosamente',
            user: {
                user_id: result.pk_user,
                nombre_usuario: userData.name,
                nombre: userData.firstName,
                apellido: userData.lastName,
                telefono: userData.pkPhone,
                birthday: userData.birthdate,
                gender: userData.gender,
                fk_level: userData.fkLevel
            }
        });

    } catch (error) {
        console.error('Error en createUsers:', error);
        
        // Manejar errores específicos
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ 
                success: false, 
                message: 'El teléfono o nombre de usuario ya está registrado' 
            });
        }

        return res.status(500).json({ 
            success: false, 
            message: 'Error del servidor al crear usuario',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}
}