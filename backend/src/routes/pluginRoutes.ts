import { Router, RequestHandler } from 'express';
import multer from 'multer';
import path from 'path';
import { PluginController } from '../controllers/pluginController';

const router = Router();
const upload = multer({ dest: path.resolve(__dirname, '../../../uploads') });

router.post('/upload', upload.single('plugin') as RequestHandler, PluginController.uploadPlugin as RequestHandler);
router.get('/', PluginController.listPlugins as RequestHandler);
router.delete('/:name', PluginController.removePlugin as RequestHandler);

export default router; 