import type { Request, Response } from "express"
import User from "../models/User"
import { chekcPassword, hashPassword } from "../utils/auth"
import Token from "../models/Token"
import { generateToken } from "../utils/token"
import { AutEmail } from "../emails/AuthEmail"
import { generateJWT } from "../utils/jwt"

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

    static login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body

        const user = await User.findOne({ email })

        //Usuario no existe
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' })
        }

        //Cuenta no confirmada
        if (!user.confirmed) {
            const token = new Token()
            token.user = user._id
            token.token = generateToken()
            await token.save()

            AutEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            })

            return res.status(401).json({
                error: 'La cuenta no ha sido verificada, se ha enviado un nuevo correo de verificación'
            })
        }

        //Password incorrecta
        const isPasswordCorrect = await chekcPassword(password, user.password)
        if (!isPasswordCorrect) {
            return res.status(401).json({ error: 'Password no valida' })
        }

        const token = generateJWT({id: user._id})
        //Login correcto
        return res.send(token)

    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: 'Hubo un error' })
    }
}

    static requestConfirmationCode = async(req: Request, res: Response) => {
        try {
            const { email } = req.body
            
            //User existe
            const user = await User.findOne({email})
            if(!user){
                const error = new Error('El usuario no esta registrado')
                return res.status(404).json({error: error.message})
            }

            if(user.confirmed){
                const error = new Error('El usuario ya esta confirmado')
                return res.status(403).json({error: error.message})
            }

            //Generar el token
            const token =  new Token()
            token.token = generateToken()
            token.user = user._id
            
            //Envio de mail confirmacion
            AutEmail.sendConfirmationEmail({email: user.email, name: user.name, token: token.token})

            await Promise.allSettled([user.save(), token.save()])
            res.send('Token de confirmación enviado nuevamente a tu email')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static forgotPassword = async(req: Request, res: Response) => {
        try {
            const { email } = req.body
            
            //User existe
            const user = await User.findOne({email})
            if(!user){
                const error = new Error('El usuario no esta registrado')
                return res.status(404).json({error: error.message})
            }

            //Generar el token
            const token =  new Token()
            token.token = generateToken()
            token.user = user._id
            
            //Envio de mail confirmacion
            AutEmail.sendForgotPasswordConfirmation({email: user.email, name: user.name, token: token.token})

            await Promise.allSettled([token.save()])
            res.send('Revisa tu email para ver las instrucciones')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static validateToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.body
            
            const tokenExist = await Token.findOne({ token })
            if (!tokenExist) {
                return res.status(404).json({ error: 'Token no valido' })
            }

            return res.send('Token válido, define tu nuevo password')
        } catch (error) {
            return res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static updatePasswordWithToken = async (req: Request, res: Response) => {
        try {
            
            const token = req.params.token
            const { password } = req.body
            
            const tokenExist = await Token.findOne({ token })
            if (!tokenExist) {
                return res.status(404).json({ error: 'Token no valido' })
            }

            //Consultar usuario
            const user = await User.findById(tokenExist.user)

            //Hash Password
            user.password = await hashPassword(password)

            await Promise.allSettled([user.save(), tokenExist.deleteOne()])

            return res.send('El password se reestablecio correctamente')
        } catch (error) {
            return res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static user = async (req: Request, res: Response) => {
       return res.json(req.user)
    }

    static updateProfile = async (req: Request, res: Response) => {
        const { name, email } = req.body

        const userExists = await User.findOne({email})

        if(userExists && userExists._id.toString() !== req.user._id.toString()){
           return res.status(409).json({ error: 'Ese email ya esta registrado' }) 
        }

        req.user.name = name
        req.user.email = email

        try{
            await req.user.save()
            res.send('Perfil actualizado correctamente')
        }catch{
            return res.status(500).json({ error: 'Hubo un error' })
        } 
    }

    static updateCurrentUserPassword = async (req: Request, res: Response) => {
        const { curent_password,  password, password_confirmation} = req.body

        const user = await User.findById(req.user._id)
        const isPasswordCorrect = await chekcPassword(curent_password, user.password)

        if(!isPasswordCorrect){
           return res.status(401).json({ error: 'El pasword actual es incorrecto' }) 
        }

        try{
            user.password = await hashPassword(password)
            await user.save()
            res.send('Pasword actualizado correctamente')
        }catch{
            return res.status(500).json({ error: 'Hubo un error' })
        } 
    }
}