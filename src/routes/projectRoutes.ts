import { Router } from "express";
import { ProjectController } from "../controllers/ProjectController";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middleware/validation";
import { TaskController } from "../controllers/TaskController";
import { projectExists } from "../middleware/project";
import { taskBelongsToProject, taskExists } from "../middleware/task";

const router = Router()
console.log('✅ PROJECT ROUTES CARGADAS');
router.post('/', 
    body('projectName').notEmpty().withMessage('projectName es obligatorio'),
    body('clientName').notEmpty().withMessage('clientName es obligatorio'),
    body('description').notEmpty().withMessage('description es obligatorio'),
    handleInputErrors,
    ProjectController.createProject
)

router.get('/', ProjectController.getAllProjects)
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
    param('taskId').isMongoId().withMessage('ID no valido'),
    body('name').notEmpty().withMessage('name es obligatorio'),
    body('description').notEmpty().withMessage('description es obligatorio'),
    handleInputErrors,
    TaskController.updateTask
)

router.delete('/:projectId/tasks/:taskId',
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

export default router