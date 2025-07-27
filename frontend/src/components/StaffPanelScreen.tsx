import React, { useState, useEffect } from 'react';
import { staffApi } from '../api/api';
import { QueueItem } from '../types'; // Assuming you have a QueueItem type defined

interface StaffPanelScreenProps {
  onLogout: () => void;
}

const StaffPanelScreen: React.FC<StaffPanelScreenProps> = ({ onLogout }) => {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await staffApi.getQueue();
      if (response.success && response.data) {
        setQueue(response.data as QueueItem[]);
      } else {
        setError(response.error || 'Failed to fetch queue');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQueueItem = async (itemId: string, status: string) => {
    try {
      const response = await staffApi.updateQueueItem(itemId, status);
      if (response.success) {
        alert('Queue item updated successfully');
        fetchQueue(); // Refresh the list
      } else {
        alert(response.error || 'Failed to update queue item');
      }
    } catch (err: any) {
      alert(err.message || 'Network error');
    }
  };

  if (loading) return <div className="text-center text-white">Loading queue...</div>;
  if (error) return <div className="text-center text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 text-white p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-pink-400">Staff Panel</h1>
        <button
          onClick={onLogout}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
        >
          Logout
        </button>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-purple-700">
        <h2 className="text-2xl font-semibold mb-4">Current Queue</h2>
        {queue.length === 0 ? (
          <p className="text-gray-400">No items in queue.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-700 rounded-lg">
              <thead>
                <tr>
                  <th className="py-3 px-4 text-left text-gray-300">Player</th>
                  <th className="py-3 px-4 text-left text-gray-300">Song</th>
                  <th className="py-3 px-4 text-left text-gray-300">Status</th>
                  <th className="py-3 px-4 text-left text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {queue.map((item) => (
                  <tr key={item.id} className="border-t border-gray-600">
                    <td className="py-3 px-4">{item.player?.nickname}</td>
                    <td className="py-3 px-4">{item.song.name}</td>
                    <td className="py-3 px-4">
                      <select
                        value={item.status}
                        onChange={(e) => handleUpdateQueueItem(item.id, e.target.value)}
                        className="bg-gray-800 border border-gray-600 rounded py-1 px-2 text-white"
                      >
                        <option value="pending">Pending</option>
                        <option value="playing">Playing</option>
                        <option value="completed">Completed</option>
                        <option value="skipped">Skipped</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleUpdateQueueItem(item.id, 'playing')}
                        className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded-md text-sm mr-2 transition-colors duration-300"
                      >
                        Set Playing
                      </button>
                      <button
                        onClick={() => handleUpdateQueueItem(item.id, 'completed')}
                        className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-md text-sm transition-colors duration-300"
                      >
                        Set Completed
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffPanelScreen;