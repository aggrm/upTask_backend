import type { Request, Response } from "express"
import Project from "../models/Project"


export class ProjectController{
    
    static createProject = async (req: Request, res: Response) => {
        const project = new Project(req.body)

        //Asignamos un manager
        project.manager = req.user._id

        try {
            await project.save() 
            res.send('Proyecto creado correctamente')
        } catch (error) {
            console.log(error)
        }
    }
    
    static getAllProjects = async (req: Request, res: Response) => {
        
        try {
            const projects = await Project.find({
                $or: [
                    {manager: req.user._id},
                    {team: {$in: [req.user._id]}}
                ]
            })
            res.send(projects)
        } catch (error) {
            console.log(error)
        }
    }

    static getProjectById = async (req: Request, res: Response) => {
        const {id} = req.params
        try {
            const project = await (await Project.findById(id)).populate('task')
            if(!project){
                const error = new Error('Proyecto no encontrado')
                return res.status(404).json({error: error.message})
            }
            if(project.manager.toString() !== req.user._id.toString() && !project.team.includes(req.user._id)){
                const error = new Error('Acción no autorizada')
                return res.status(404).json({error: error.message})
            }
            res.send(project)
        } catch (error) {
            console.log(error)
        }
    }

    static updateProjectById = async (req: Request, res: Response) => {
        const {id} = req.params
        try {
            const project = await Project.findById(id)
            if(!project){
                const error = new Error('Proyecto no encontrado')
                return res.status(404).json({error: error.message})
            }

            if(project.manager.toString() !== req.user._id.toString()){
                const error = new Error('Solo el manager puede hacer esta acción')
                return res.status(404).json({error: error.message})
            }

            project.clientName = req.body.clientName
            project.projectName = req.body.projectName
            project.description = req.body.description

            await project.save()
            res.send('Proyecto actualizado')
        } catch (error) {
            console.log(error)
        }
    }

    static deleteProjectById = async (req: Request, res: Response) => {
        const {id} = req.params
        try {
            const project = await Project.findById(id, req.body)
            if(!project){
                const errorr = new Error('Proyecto no encontrado')
                return res.status(404).json({error: errorr.message})
            }

            if(project.manager.toString() !== req.user._id.toString()){
                const error = new Error('Solo el manager puede hacer esta acción')
                return res.status(404).json({error: error.message})
            }

            await project.deleteOne()
            res.send('Proyecto eliminado')
        } catch (error) {
            console.log(error)
        }
    }
}