import {type Request, type Response, type NextFunction, json} from 'express'
import Project, { IProject } from '../models/Project'
import Task, { ITask } from '../models/Task'

declare global {
    namespace Express {
        interface Request {
            task: ITask
        }
    }
}

export async function taskExists(req: Request, res: Response, next: NextFunction){
    try {
        const { taskId } = req.params
        const task = await Task.findById(taskId)
        if(!task){
            const error = new Error('Task no encontrado')
            return res.status(404).json({error: error.message})
        }
        req.task = task
        next()
    } catch (error) {
        res.status(500).json({error: 'Hubo un error'})
    }
}

export async function taskBelongsToProject(req: Request, res: Response, next: NextFunction){
    try {
         if (!req.task.project._id.equals(req.project._id)) {
            const error = new Error('Accion no válida')
            return res.status(400).json({ error: error.message })
        }
        next()
    } catch (error) {
        res.status(500).json({error: 'Hubo un error'})
    }
}

export async function hashAuthorization(req: Request, res: Response, next: NextFunction){
    try {
         if (req.user._id.toString() !== req.project._id.toString()) {
            const error = new Error('Accion no válida')
            return res.status(400).json({ error: error.message })
        }
        next()
    } catch (error) {
        res.status(500).json({error: 'Hubo un error'})
    }
}