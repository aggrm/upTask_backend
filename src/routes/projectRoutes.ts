import { Router } from "express";
import { ProjectController } from "../controllers/ProjectController";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middleware/validation";
import { TaskController } from "../controllers/TaskController";
import { projectExists } from "../middleware/project";
import { hashAuthorization, taskBelongsToProject, taskExists } from "../middleware/task";
import { authenticate } from "../middleware/auth";
import { TeamMemberController } from "../controllers/TeamController";
import { NotesController } from "../controllers/NotesController";

const router = Router()
console.log('✅ PROJECT ROUTES CARGADAS');

router.use(authenticate)
router.post('/', 
    body('projectName').notEmpty().withMessage('projectName es obligatorio'),
    body('clientName').notEmpty().withMessage('clientName es obligatorio'),
    body('description').notEmpty().withMessage('description es obligatorio'),
    handleInputErrors,
    ProjectController.createProject
)

router.get('/', authenticate, ProjectController.getAllProjects)

router.get('/:id', 
    param('id').isMongoId().withMessage('ID no valido'),
    handleInputErrors,
    ProjectController.getProjectById
)

router.put('/:id', 
    param('id').isMongoId().withMessage('ID no valido'),
    body('projectName').notEmpty().withMessage('projectName es obligatorio'),
    body('clientName').notEmpty().withMessage('clientName es obligatorio'),
    body('description').notEmpty().withMessage('description es obligatorio'),
    handleInputErrors,
    ProjectController.updateProjectById
)

router.delete('/:id', 
    param('id').isMongoId().withMessage('ID no valido'),
    handleInputErrors,
    ProjectController.deleteProjectById
)

/** 
 * 
 * Routes for task 
 * 
 */
router.param('projectId', projectExists)
router.post('/:projectId/tasks',
    hashAuthorization,
    body('name').notEmpty().withMessage('name es obligatorio'),
    body('description').notEmpty().withMessage('description es obligatorio'),
    handleInputErrors,
    TaskController.createTask
)

router.get('/:projectId/tasks',
    TaskController.getProjectTasks
)

router.param('taskId', taskExists)
router.param('taskId', taskBelongsToProject)

router.get('/:projectId/tasks/:taskId',
    param('taskId').isMongoId().withMessage('ID no valido'),
    handleInputErrors,
    TaskController.getTasksById
)

router.put('/:projectId/tasks/:taskId',
    hashAuthorization,
    param('taskId').isMongoId().withMessage('ID no valido'),
    body('name').notEmpty().withMessage('name es obligatorio'),
    body('description').notEmpty().withMessage('description es obligatorio'),
    handleInputErrors,
    TaskController.updateTask
)

router.delete('/:projectId/tasks/:taskId',
    hashAuthorization,
    param('taskId').isMongoId().withMessage('ID no valido'),
    handleInputErrors,
    TaskController.deleteTask
)

router.post('/:projectId/tasks/:taskId/status',
    param('taskId').isMongoId().withMessage('ID no valido'),
    body('status').notEmpty().withMessage('El status es obligatorio'),
    handleInputErrors,
    TaskController.updateStatus
)

/** 
 * 
 * Routes for teams 
 * 
 */
router.post('/:projectId/team/find',
    body('email').notEmpty().toLowerCase().withMessage('Email no válido'),
    handleInputErrors,
    TeamMemberController.findbymmeberByEmail
)

router.post('/:projectId/team',
    body('id').isMongoId().withMessage('ID no valido'),
    handleInputErrors,
    TeamMemberController.addMemberById
)

router.delete('/:projectId/team/:userId',
    param('userId').isMongoId().withMessage('ID no valido'),
    handleInputErrors,
    TeamMemberController.deleteMemberById
)

router.get('/:projectId/team',
    TeamMemberController.getProjectTeam
)

/** Routes for Notes */
router.post('/:projectId/tasks/:taskId/notes',
    body('content').notEmpty().withMessage('El contenido de la nota es obligatorio'),
    handleInputErrors,
    NotesController.createNote
)

router.get('/:projectId/tasks/:taskId/notes',
    NotesController.getTasksNoteByIdTask
)

router.delete('/:projectId/tasks/:taskId/notes/:noteId',
    param('noteId').isMongoId().withMessage('ID nota no valido'),
    handleInputErrors,
    NotesController.deleteNoteTaskById
)

export default router