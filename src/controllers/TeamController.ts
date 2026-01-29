import type { Request, Response } from "express"
import User from "../models/User"
import Project from "../models/Project"


export class TeamMemberController {

    static findbymmeberByEmail = async(req: Request, res: Response) => {
        const { email } = req.body
            
        //Prevenir duplicados
        const user = await User.findOne({email}).select('id email name')
        if(!user){
            const error = new Error('El usuario no se ha encontrado')
            return res.status(404).json({error: error.message})
        }
        res.send(user)   
    }

    static addMemberById = async(req: Request, res: Response) => {
        const { id } = req.body
        //Prevenir duplicados
        const user = await User.findById(id).select('id')
        if(!user){
            const error = new Error('El usuario no se ha encontrado')
            return res.status(404).json({error: error.message})
        }

        if(req.project.team.some(team => team.toString()  === user._id.toString())){
            const error = new Error('El usuario ya se encuentra en tu equipo')
            return res.status(409).json({error: error.message})
        }
        req.project.team.push(user._id)
        await req.project.save()

        res.send("Usuario añadido al proyecto")
    }


    static deleteMemberById = async(req: Request, res: Response) => {
        const { id } = req.body
        
        if(!req.project.team.some(team => team.toString()  === id)){
            const error = new Error('El usuario no se encuentra')
            return res.status(409).json({error: error.message})
        }

        req.project.team = req.project.team.filter(teamMember => teamMember.toString() !== id)
        await req.project.save()
        res.send("Usuario eliminado del proyecto")
    }

    static getProjectTeam = async(req: Request, res: Response) => {
        const project  = await Project.findById(req.project._id).populate({
            path: 'team',
            select: '_id email name'
        })

        res.json(project.team)
    }
}