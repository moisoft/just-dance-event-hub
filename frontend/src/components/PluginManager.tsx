import React, { useState, useEffect, useRef } from 'react';
import { pluginAPI } from '../services/api';

// Definição do tipo de plugin
interface PluginManifest {
    name: string;
    version?: string;
    description?: string;
    [key: string]: any;
}

interface PluginManagerProps {
    onBack: () => void;
}

export default function PluginManager({ onBack }: PluginManagerProps) {
    const [plugins, setPlugins] = useState<PluginManifest[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchPlugins = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await pluginAPI.list();
            setPlugins(res.plugins || []);
        } catch (err) {
            setError('Erro ao listar plugins.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlugins();
    }, []);

    const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        const file = fileInputRef.current?.files?.[0];
        if (!file) {
            setError('Selecione um arquivo .zip para upload.');
            return;
        }
        const formData = new FormData();
        formData.append('plugin', file);
        setLoading(true);
        try {
            await pluginAPI.upload(formData);
            setSuccess('Plugin enviado e instalado com sucesso!');
            fetchPlugins();
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (err: any) {
            setError(err.message || 'Erro ao enviar plugin.');
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (name: string) => {
        if (!window.confirm(`Remover plugin "${name}"?`)) return;
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            await pluginAPI.remove(name);
            setSuccess('Plugin removido com sucesso!');
            fetchPlugins();
        } catch (err: any) {
            setError(err.message || 'Erro ao remover plugin.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto bg-gray-900 p-6 rounded-2xl shadow-lg">
            <button onClick={onBack} className="mb-4 text-cyan-400">&larr; Voltar</button>
            <h1 className="text-3xl font-bold mb-6">Gerenciar Plugins</h1>
            <form onSubmit={handleUpload} className="mb-6 flex items-center space-x-2">
                <input type="file" accept=".zip" ref={fileInputRef} className="bg-gray-800 p-2 rounded" />
                <button type="submit" disabled={loading} className="bg-pink-600 px-4 py-2 rounded text-white font-bold disabled:opacity-50">Enviar Plugin</button>
            </form>
            {error && <div className="mb-4 text-red-400">{error}</div>}
            {success && <div className="mb-4 text-green-400">{success}</div>}
            <h2 className="text-xl font-bold mb-2">Plugins Instalados</h2>
            {loading ? <p>Carregando...</p> : (
                <ul className="space-y-2">
                    {plugins.length === 0 && <li className="text-gray-400">Nenhum plugin instalado.</li>}
                    {plugins.map((plugin) => (
                        <li key={plugin.name} className="bg-gray-800 p-3 rounded flex items-center justify-between">
                            <div>
                                <span className="font-bold text-pink-400">{plugin.name}</span>
                                {plugin.version && <span className="ml-2 text-gray-400">v{plugin.version}</span>}
                                {plugin.description && <div className="text-gray-400 text-sm">{plugin.description}</div>}
                            </div>
                            <button onClick={() => handleRemove(plugin.name)} className="bg-red-600 px-3 py-1 rounded text-white font-bold hover:bg-red-700">Remover</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
} 