import type { Request, Response } from "express"
import Project from "../models/Project"


export class ProjectController{
    
    static createProject = async (req: Request, res: Response) => {
        const project = new Project(req.body)
        try {
            await project.save() 
            res.send('Proyecto creado correctamente')
        } catch (error) {
            console.log(error)
        }
    }
    
    static getAllProjects = async (req: Request, res: Response) => {
        
        try {
            const projects = await Project.find({})
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
            await project.deleteOne()
            res.send('Proyecto eliminado')
        } catch (error) {
            console.log(error)
        }
    }
}