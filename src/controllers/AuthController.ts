import type { Request, Response } from "express"
import User from "../models/User"
import { chekcPassword, hashPassword } from "../utils/auth"
import Token from "../models/Token"
import { generateToken } from "../utils/token"
import { transporter } from "../config/nodemailer"
import { AutEmail } from "../emails/AuthEmail"

export class AuthController {

    static createAccount = async(req: Request, res: Response) => {
        try {
            const { password, email } = req.body
            
            //Prevenir duplicados
            const userExist = await User.findOne({email})
            if(userExist){
                const error = new Error('El usuario ya ha sido registrado')
                return res.status(409).json({error: error.message})
            }
            
            //Crea un usuario
            const user = new User(req.body)

            //Hash Password
            user.password = await hashPassword(password)

            //Generar el token
            const token =  new Token()
            token.token = generateToken()
            token.user = user._id
            
            //Envio de mail confirmacion
            AutEmail.sendConfirmationEmail({email: user.email, name: user.name, token: token.token})

            await Promise.allSettled([user.save(), token.save()])
            res.send('Cuenta creada, revisa tu email para confirmar la cuenta')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }


    static confirmAccount = async (req: Request, res: Response) => {
        try {
            const { token } = req.body
            
            const tokenExist = await Token.findOne({ token })
            if (!tokenExist) {
                return res.status(404).json({ error: 'Token no valido' })
            }

            const user = await User.findById(tokenExist.user)
            if (!user) {
                return res.status(404).json({ error: 'Usuario no encontrado' })
            }

            user.confirmed = true

            await Promise.allSettled([
                user.save(),
                tokenExist.deleteOne()
            ])

            return res.send('Cuenta confirmada correctamente')
        } catch (error) {
            return res.status(500).json({ error: 'Hubo un error' })
        }
    }   

    static login = async(req: Request, res: Response) => {
        try {
            const {email, password} = req.body
            const user = await User.findOne({email})

            console.log(`el usuario es este ${user.email}`)

            if(!user){
                const error = new Error('Usario no valido')
                res.status(404).json({error: error.message})
            }

            if(!user.confirmed){
                const token = new Token()
                token.user = user._id
                token.token = generateToken()
                await token.save()

                AutEmail.sendConfirmationEmail({email: user.email, name: user.name, token: token.token})

                const error = new Error('La cuenta no ha sido verificada, se ha enviado un nuevo correo de verifiacción a su email')
                res.status(401).json({error: error.message})
            }
            

            const isPasswordCorrect = await chekcPassword(password, user.password)
            if(!isPasswordCorrect){
                const error = new Error('password no valida')
                res.status(401).json({error: error.message})
            }
            
            res.send('Usuario logado correctamente')
        } catch (error) {
            console.log(error)
            res.status(500).json({error: 'Hubo un error'})
        }
    }
}