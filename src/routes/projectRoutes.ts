import { Router } from "express";
import { ProjectController } from "../controllers/ProjectController";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middleware/validation";

const router = Router()

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

export default router