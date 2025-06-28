import React from 'react';
import { useEffect, useState } from 'react';
import { getPlayerProgress } from '../services/api';

const PlayerDashboard: React.FC = () => {
    const [playerData, setPlayerData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlayerData = async () => {
            try {
                const data = await getPlayerProgress();
                setPlayerData(data);
            } catch (error) {
                console.error("Error fetching player data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPlayerData();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Player Dashboard</h1>
            {playerData ? (
                <div>
                    <h2>Welcome, {playerData.nickname}!</h2>
                    <p>XP: {playerData.xp}</p>
                    <p>Level: {playerData.level}</p>
                    <h3>Your Progress:</h3>
                    <ul>
                        {playerData.progress.map((item: any, index: number) => (
                            <li key={index}>{item}</li>
                        ))}
                    </ul>
                </div>
            ) : (
                <p>No player data available.</p>
            )}
        </div>
    );
};

export default PlayerDashboard;