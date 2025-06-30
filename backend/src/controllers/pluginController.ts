import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import unzipper from 'unzipper';

const PLUGIN_DIR = path.resolve(__dirname, '../../../plugins');

// Garante que a pasta de plugins existe
if (!fs.existsSync(PLUGIN_DIR)) {
    fs.mkdirSync(PLUGIN_DIR);
}

// Adicionar no topo do arquivo, se necessário:
// declare module 'unzipper';

export class PluginController {
    // Upload de plugin .zip
    static async uploadPlugin(req: Request & { file?: Express.Multer.File }, res: Response) {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Nenhum arquivo enviado.' });
        }
        const zipPath = req.file.path;
        try {
            // Descompacta o zip em uma pasta temporária
            const tempDir = path.join(PLUGIN_DIR, `temp_${Date.now()}`);
            fs.mkdirSync(tempDir);
            await fs.createReadStream(zipPath)
                .pipe(unzipper.Extract({ path: tempDir }))
                .promise();

            // Verifica se existe plugin.json
            const manifestPath = path.join(tempDir, 'plugin.json');
            if (!fs.existsSync(manifestPath)) {
                fs.rmSync(tempDir, { recursive: true, force: true });
                fs.unlinkSync(zipPath);
                return res.status(400).json({ success: false, message: 'plugin.json não encontrado no plugin.' });
            }
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
            const pluginName = manifest.name;
            if (!pluginName) {
                fs.rmSync(tempDir, { recursive: true, force: true });
                fs.unlinkSync(zipPath);
                return res.status(400).json({ success: false, message: 'Nome do plugin ausente no plugin.json.' });
            }
            // Move o plugin para a pasta definitiva
            const finalDir = path.join(PLUGIN_DIR, pluginName);
            if (fs.existsSync(finalDir)) {
                fs.rmSync(finalDir, { recursive: true, force: true });
            }
            fs.renameSync(tempDir, finalDir);
            fs.unlinkSync(zipPath);
            return res.status(200).json({ success: true, message: 'Plugin instalado com sucesso!', plugin: manifest });
        } catch (err) {
            if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
            return res.status(500).json({ success: false, message: 'Erro ao instalar plugin.', error: String(err) });
        }
    }

    // Listar plugins instalados
    static async listPlugins(_req: Request, res: Response) {
        try {
            const plugins = fs.readdirSync(PLUGIN_DIR)
                .filter(dir => fs.existsSync(path.join(PLUGIN_DIR, dir, 'plugin.json')))
                .map(dir => {
                    const manifest = JSON.parse(fs.readFileSync(path.join(PLUGIN_DIR, dir, 'plugin.json'), 'utf-8'));
                    return { name: dir, ...manifest };
                });
            return res.status(200).json({ success: true, plugins });
        } catch (err) {
            return res.status(500).json({ success: false, message: 'Erro ao listar plugins.', error: String(err) });
        }
    }

    // Remover plugin
    static async removePlugin(req: Request, res: Response) {
        const { name } = req.params;
        if (!name) return res.status(400).json({ success: false, message: 'Nome do plugin não informado.' });
        const pluginPath = path.join(PLUGIN_DIR, name);
        if (!fs.existsSync(pluginPath)) return res.status(404).json({ success: false, message: 'Plugin não encontrado.' });
        try {
            fs.rmSync(pluginPath, { recursive: true, force: true });
            return res.status(200).json({ success: true, message: 'Plugin removido com sucesso.' });
        } catch (err) {
            return res.status(500).json({ success: false, message: 'Erro ao remover plugin.', error: String(err) });
        }
    }
} 