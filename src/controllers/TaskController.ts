import type {Request, Response} from 'express'
import Project from '../models/Project'
import Task from '../models/Task'

export class TaskController {
    static createTask = async (req: Request, res: Response) => {
        try {
            const task = new Task(req.body)
            task.project = req.project._id
            req.project.task.push(task._id)
            await Promise.allSettled([
                task.save(),
                req.project.save()
            ])
            res.send('Tarea creada correctamente')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static getProjectTasks = async (req: Request, res: Response) => {
        try {
            const task = await Task.find({project: req.project._id}).populate('project')
            res.json(task)
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static getTasksById = async (req: Request, res: Response) => {
        try {
            const task = await Task.findById(req.task._id).populate(
                {path: 'completeBy.user', select: '_id name email'})

            res.json(task)
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static updateTask = async (req: Request, res: Response) => {
        try {
            req.task.name = req.body.name
            req.task.description = req.body.description
            await req.task.save()
            res.json("Tarea actualizada correctamente")
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static deleteTask = async (req: Request, res: Response) => {
        try {
            req.project.task = req.project.task .filter(task => task._id.toString() !== req.task._id.toString())
            await Promise.allSettled([
                req.task.deleteOne(),
                req.project.save()
            ])
            res.json("Tarea eliminada correctamente")
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static updateStatus = async (req: Request, res: Response) => {
        try {
            const { status } = req.body
            req.task.status = status
            const data = {
                user: req.user._id,
                status
            }
            req.task.completeBy.push(data)
            await req.task.save()
            res.send("Estado de la tarea actualizada correctamente")
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }
}