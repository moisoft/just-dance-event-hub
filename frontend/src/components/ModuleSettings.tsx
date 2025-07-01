import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Switch, FormControlLabel, Button, Alert, Chip, Divider } from '@mui/material';
import { Settings, CheckCircle, Cancel } from '@mui/icons-material';

interface ModuleConfig {
    id: string;
    modulo: string;
    ativo: boolean;
    configuracao: any;
}

interface AvailableModule {
    name: string;
    description: string;
    defaultEnabled: boolean;
}

interface ModuleSettingsProps {
    eventId: string;
    isOrganizer: boolean;
}

const ModuleSettings: React.FC<ModuleSettingsProps> = ({ eventId, isOrganizer }) => {
    const [modules, setModules] = useState<ModuleConfig[]>([]);
    const [availableModules, setAvailableModules] = useState<AvailableModule[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchModuleConfigs();
    }, [eventId]);

    const fetchModuleConfigs = async () => {
        try {
            const response = await fetch(`/api/modules/${eventId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setModules(data.modules);
                setAvailableModules(data.availableModules);
            } else {
                setMessage({ type: 'error', text: 'Erro ao carregar configurações dos módulos' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Erro de conexão' });
        } finally {
            setLoading(false);
        }
    };

    const toggleModule = async (moduleName: string, ativo: boolean) => {
        if (!isOrganizer) return;

        setSaving(true);
        try {
            const response = await fetch(`/api/modules/${eventId}/${moduleName}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ ativo })
            });

            if (response.ok) {
                setModules(prev => prev.map(m => 
                    m.modulo === moduleName ? { ...m, ativo } : m
                ));
                setMessage({ 
                    type: 'success', 
                    text: `Módulo ${ativo ? 'ativado' : 'desativado'} com sucesso!` 
                });
            } else {
                setMessage({ type: 'error', text: 'Erro ao atualizar módulo' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Erro de conexão' });
        } finally {
            setSaving(false);
        }
    };

    const resetToDefaults = async () => {
        if (!isOrganizer) return;

        setSaving(true);
        try {
            const response = await fetch(`/api/modules/${eventId}/reset`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                await fetchModuleConfigs();
                setMessage({ type: 'success', text: 'Configurações resetadas para padrão!' });
            } else {
                setMessage({ type: 'error', text: 'Erro ao resetar configurações' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Erro de conexão' });
        } finally {
            setSaving(false);
        }
    };

    const getModuleIcon = (moduleName: string) => {
        const icons: { [key: string]: string } = {
            queue: '🎵',
            tournament: '🏆',
            xp_system: '⭐',
            team_mode: '👥',
            music_requests: '🎤',
            leaderboard: '📊',
            chat: '💬',
            voting: '🗳️'
        };
        return icons[moduleName] || '⚙️';
    };

    const getModuleStatusColor = (ativo: boolean) => {
        return ativo ? 'success' : 'default';
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" p={3}>
                <Typography>Carregando configurações...</Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                <Typography variant="h5" component="h2">
                    <Settings sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Configurações dos Módulos
                </Typography>
                {isOrganizer && (
                    <Button
                        variant="outlined"
                        onClick={resetToDefaults}
                        disabled={saving}
                        startIcon={<Settings />}
                    >
                        Resetar para Padrão
                    </Button>
                )}
            </Box>

            {message && (
                <Alert 
                    severity={message.type} 
                    onClose={() => setMessage(null)}
                    sx={{ mb: 2 }}
                >
                    {message.text}
                </Alert>
            )}

            <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={2}>
                {modules.map((module) => {
                    const availableModule = availableModules.find(am => am.name === module.modulo);
                    
                    return (
                        <Card key={module.id} variant="outlined">
                            <CardContent>
                                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                                    <Box display="flex" alignItems="center">
                                        <Typography variant="h6" component="span" sx={{ mr: 1 }}>
                                            {getModuleIcon(module.modulo)}
                                        </Typography>
                                        <Typography variant="h6" component="span">
                                            {availableModule?.description || module.modulo}
                                        </Typography>
                                    </Box>
                                    <Chip
                                        label={module.ativo ? 'Ativo' : 'Inativo'}
                                        color={getModuleStatusColor(module.ativo)}
                                        size="small"
                                        icon={module.ativo ? <CheckCircle /> : <Cancel />}
                                    />
                                </Box>

                                <Typography variant="body2" color="text.secondary" mb={2}>
                                    {availableModule?.description}
                                </Typography>

                                {isOrganizer ? (
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={module.ativo}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => toggleModule(module.modulo, e.target.checked)}
                                                disabled={saving}
                                            />
                                        }
                                        label={module.ativo ? 'Desativar módulo' : 'Ativar módulo'}
                                    />
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        Apenas organizadores podem alterar configurações
                                    </Typography>
                                )}

                                {module.ativo && module.configuracao && (
                                    <Box mt={2}>
                                        <Divider sx={{ my: 1 }} />
                                        <Typography variant="subtitle2" color="text.secondary" mb={1}>
                                            Configurações atuais:
                                        </Typography>
                                        <Box component="pre" sx={{ 
                                            fontSize: '0.75rem', 
                                            backgroundColor: 'grey.100', 
                                            p: 1, 
                                            borderRadius: 1,
                                            overflow: 'auto'
                                        }}>
                                            {JSON.stringify(module.configuracao, null, 2)}
                                        </Box>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </Box>

            {!isOrganizer && (
                <Alert severity="info" sx={{ mt: 2 }}>
                    Você precisa ser o organizador do evento para alterar as configurações dos módulos.
                </Alert>
            )}
        </Box>
    );
};

export default ModuleSettings;