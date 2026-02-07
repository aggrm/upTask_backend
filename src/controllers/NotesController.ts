import type { Request, Response } from "express"
import { Types } from "mongoose"
import Note, {INote} from "../models/Note"

type NoteParams = {
    noteId: Types.ObjectId
}

export class NotesController {
    static createNote = async (req: Request<{}, {}, INote>, res: Response) => {
        const { content } = req.body
        const note = new Note
        note.content = content
        note.createBy = req.user._id
        note.task = req.task._id


        req.task.notes.push(note._id)
        try {
            await Promise.allSettled([req.task.save(), note.save()])
            res.send('Nota creada correctamente')
        } catch (error) {
           res.status(500).json({error: 'Hubo un error'})
        }
    }

    static getTasksNoteByIdTask = async (req: Request, res: Response) => {
        try {
            const notes = await Note.find({task: req.task._id})
            res.json(notes)
        } catch (error) {
           res.status(500).json({error: 'Hubo un error'})
        }
    }

    static deleteNoteTaskById = async (req: Request<NoteParams>, res: Response) => {
        try {

            const {noteId} = req.params;
            const note = await Note.findById(noteId)
            if(!note){
                return res.status(404).json({error: 'Nota no encontrada'})
            }

            
            if(note.createBy.toString() !== req.user._id.toString()){
                return res.status(401).json({error: 'Acción no valida'})
            }

            req.task.notes = req.task.notes.filter (note => note.toString() !== noteId.toString())
            try {
                await Promise.allSettled([req.task.save(), note.deleteOne()])
                res.json("Nota eliminada correctamente")
            } catch (error) {
                res.status(500).json({error: 'Hubo un error'})
            }
           
        } catch (error) {
           res.status(500).json({error: 'Hubo un error'})
        }
    }
}