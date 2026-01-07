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
            const {taskId} = req.params
            const task = await Task.findById(taskId).populate('project')
            if(!task){
                const error = new Error('Task no encontrado')
                return res.status(404).json({error: error.message})
            }

            if (!task.project._id.equals(req.project._id)) {
                const error = new Error('Accion no válida')
                return res.status(400).json({ error: error.message })
            }

            res.json(task)
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static updateTask = async (req: Request, res: Response) => {
        try {
            const {taskId} = req.params
            const task = await Task.findById(taskId)
            if(!task){
                const error = new Error('Task no encontrado')
                return res.status(404).json({error: error.message})
            }

            if (!task.project._id.equals(req.project._id)) {
                const error = new Error('Accion no válida')
                return res.status(400).json({ error: error.message })
            }

            task.name = req.body.name
            task.description = req.body.description
            await task.save()
            res.json("Tarea actualizada correctamente")
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static deleteTask = async (req: Request, res: Response) => {
        try {
            const { taskId } = req.params
            const task = await Task.findById(taskId, req.body)
            if(!task){
                const error = new Error('Task no encontrado')
                return res.status(404).json({error: error.message})
            }

            req.project.task = req.project.task .filter(task => task._id.toString() !== taskId)
            await Promise.allSettled([
                task.deleteOne(),
                req.project.save()
            ])
            res.json("Tarea eliminada correctamente")
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }
}