import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getEventDetails } from '../services/api';
import { EventDetails } from '../types';

const EventHubScreen: React.FC = () => {
    const { code } = useParams<{ code: string }>();
    const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                const data = await getEventDetails(code);
                setEventDetails(data);
            } catch (err) {
                setError('Erro ao carregar os detalhes do evento.');
            } finally {
                setLoading(false);
            }
        };

        fetchEventDetails();
    }, [code]);

    if (loading) {
        return <div>Carregando...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    if (!eventDetails) {
        return <div>Evento não encontrado.</div>;
    }

    return (
        <div>
            <h1>{eventDetails.nome_evento}</h1>
            <p>Organizador: {eventDetails.id_organizador}</p>
            <p>Tipo: {eventDetails.tipo}</p>
            <p>Status: {eventDetails.status}</p>
            {/* Adicione mais detalhes do evento conforme necessário */}
        </div>
    );
};

export default EventHubScreen;