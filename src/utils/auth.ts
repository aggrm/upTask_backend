import bcyrpt from 'bcrypt'

export const hashPassword = async (password: string) => {
    const salt = await bcyrpt.genSalt(15)
    password = await bcyrpt.hash(password, salt)

    return password
}