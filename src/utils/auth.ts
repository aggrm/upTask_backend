import bcyrpt from 'bcrypt'

export const hashPassword = async (password: string) => {
    const salt = await bcyrpt.genSalt(15)
    password = await bcyrpt.hash(password, salt)

    return password
}

export const chekcPassword = async (enteredPassword: string,  storeHash: string) => {
    return await bcyrpt.compare(enteredPassword, storeHash)
}