import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { eventAPI } from '../services/api';
import { EventDetails } from '../types';

const EventContainer = styled.div`
    min-height: 100vh;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const EventCard = styled.div`
    class-name: card;
    max-width: 800px;
    width: 100%;
    margin-top: 2rem;
`;

const EventTitle = styled.h1`
    font-size: 3rem;
    text-align: center;
    margin-bottom: 2rem;
    class-name: gradient-text;
`;

const EventInfo = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    margin-top: 2rem;
`;

const InfoItem = styled.div`
    class-name: card pulse-element;
    padding: 1.5rem;
    text-align: center;

    h3 {
        font-size: 1.2rem;
        margin-bottom: 1rem;
        class-name: neon-text;
    }

    p {
        font-size: 1.1rem;
    }
`;

const LoadingContainer = styled.div`
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    font-size: 1.5rem;
    class-name: neon-text;
`;

const DancerIcon = styled.div`
    font-size: 4rem;
    margin-bottom: 1rem;
    class-name: floating-element;
    &::after {
        content: '💃';
    }
`;

const ErrorContainer = styled.div`
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: 2rem;
    
    p {
        font-size: 1.5rem;
        class-name: neon-text;
    }
`;

const EventHubScreen: React.FC = () => {
    const { code } = useParams<{ code: string }>();
    const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                if (!code) {
    setError('Código do evento não fornecido.');
    setLoading(false);
    return;
}
const data = await eventAPI.getByCode(code);
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
        return (
            <LoadingContainer>
                <DancerIcon />
                <p>Carregando...</p>
            </LoadingContainer>
        );
    }

    if (error) {
        return (
            <ErrorContainer>
                <DancerIcon />
                <p>{error}</p>
            </ErrorContainer>
        );
    }

    if (!eventDetails) {
        return (
            <ErrorContainer>
                <DancerIcon />
                <p>Evento não encontrado.</p>
            </ErrorContainer>
        );
    }

    return (
        <EventContainer>
            <EventCard>
                <DancerIcon />
                <EventTitle>{eventDetails.nome_evento}</EventTitle>
                <EventInfo>
                    <InfoItem>
                        <h3>Organizador</h3>
                        <p>{eventDetails.id_organizador}</p>
                    </InfoItem>
                    <InfoItem>
                        <h3>Tipo</h3>
                        <p>{eventDetails.tipo}</p>
                    </InfoItem>
                    <InfoItem>
                        <h3>Status</h3>
                        <p>{eventDetails.status}</p>
                    </InfoItem>
                </EventInfo>
            </EventCard>
        </EventContainer>
    );
};

export default EventHubScreen;