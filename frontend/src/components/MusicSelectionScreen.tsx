import React, { useEffect, useState } from 'react';
import { fetchMusicList } from '../services/api';
import { Music } from '../types';

const MusicSelectionScreen: React.FC = () => {
    const [musicList, setMusicList] = useState<Music[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadMusic = async () => {
            try {
                const musicData = await fetchMusicList();
                setMusicList(musicData);
            } catch (err) {
                setError('Failed to load music list');
            } finally {
                setLoading(false);
            }
        };

        loadMusic();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <h1>Select a Music</h1>
            <ul>
                {musicList.map((music) => (
                    <li key={music.id}>
                        <h2>{music.nome_musica}</h2>
                        <p>Artist: {music.artista}</p>
                        <p>Difficulty: {music.dificuldade}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MusicSelectionScreen;