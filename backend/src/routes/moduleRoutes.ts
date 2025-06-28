import { Router } from 'express';
import moduleController from '../controllers/moduleController';
import authMiddleware from '../middlewares/authMiddleware';
import { validateEventId, validateModuleName, validate, moduleSchemas } from '../middlewares/validation';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Obter configurações de módulos de um evento
router.get('/:eventId', validateEventId, moduleController.getEventModules);

// Atualizar configuração de um módulo específico
router.put('/:eventId/:moduleName', 
    validateEventId, 
    validateModuleName,
    validate(moduleSchemas.updateConfig),
    moduleController.updateModuleConfig
);

// Atualizar múltiplas configurações de módulos
router.put('/:eventId', 
    validateEventId, 
    validate(moduleSchemas.updateMultiple),
    moduleController.updateMultipleModuleConfigs
);

// Resetar configurações para padrão
router.post('/:eventId/reset', validateEventId, moduleController.resetModuleConfigs);

export default router; 