import { transporter } from "../config/nodemailer"

interface IEmail {
    email: string,
    name: string,
    token: string
}

export class AutEmail{
    static sendConfirmationEmail = async (user: IEmail) => {
        const info = await transporter.sendMail({
                from: 'UpTask <admin@uptask.com>',
                to: user.email,
                subject: 'UpTask - Confirma tu cuenta',
                text: 'UpTask - Confirma tu cuenta',
                html: `<p>Hola: ${user.name}, has creado tu cuenta en UpTask, ya casi esta todo listo, solo debes de confrmar tu cuenta.</p>
                    <p>Visita el siguiete enlace:</p>
                    <a href="${process.env.FRONTEND_URL}/auth/confirm-account">Confirmar cuenta </a>
                    <p> Ingresa el código: <b>${user.token}</b></p>
                    <p> Este token tiene un a validez de 5 minutos</p>
                
                
                `
        })

        console.log('Mensaje enviado', info.messageId)
    }
}