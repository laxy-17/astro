
import React, { useEffect, useState } from 'react';
import { listCharts, deleteChart, type SavedChart, type BirthDetails } from '../api/client';

interface Props {
    onLoad: (details: BirthDetails) => void;
    onClose: () => void;
}

export const ChartLibrary: React.FC<Props> = ({ onLoad, onClose }) => {
    const [charts, setCharts] = useState<SavedChart[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortMode, setSortMode] = useState<'date' | 'name'>('date');

    const loadCharts = async () => {
        try {
            const data = await listCharts();
            setCharts(data);
        } catch (e: any) {
            setError("Failed to load charts.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCharts();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this chart?")) return;
        try {
            await deleteChart(id);
            setCharts(charts.filter(c => c.id !== id));
        } catch (e) {
            alert("Failed to delete chart");
        }
    };

    const handleLoad = (chart: SavedChart) => {
        const details: BirthDetails = {
            date: chart.date,
            time: chart.time,
            latitude: chart.latitude,
            longitude: chart.longitude,
            ayanamsa_mode: chart.ayanamsa_mode
        };
        onLoad(details);
        onClose();
    };

    // Filter and Sort Logic
    const filteredCharts = charts
        .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            if (sortMode === 'name') {
                return a.name.localeCompare(b.name);
            } else {
                // Sort by date (Assuming ID indicates recency or saving logic? 
                // SavedChart has 'created_at'? I need to check interface.
                // Assuming ID is auto-increment, higher ID = newer.
                return b.id - a.id;
            }
        });

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0 }}>My Chart Library</h3>
                <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>×</button>
            </div>

            {/* Steps 3.3 & 3.4: Search and Sort Controls */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                <input
                    type="text"
                    placeholder="Search charts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
                <select
                    value={sortMode}
                    onChange={(e) => setSortMode(e.target.value as 'date' | 'name')}
                    style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                >
                    <option value="date">Newest First</option>
                    <option value="name">Name (A-Z)</option>
                </select>
            </div>

            {loading && <p>Loading...</p>}
            {error && <p className="text-red">{error}</p>}

            {!loading && charts.length === 0 && (
                <p style={{ color: '#888', fontStyle: 'italic' }}>No saved charts yet.</p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
                {filteredCharts.map(chart => (
                    <div key={chart.id} className="panel" style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontWeight: 'bold' }}>{chart.name}</div>
                            <div style={{ fontSize: '0.85rem', color: '#666' }}>
                                {chart.date} @ {chart.time} ({chart.ayanamsa_mode})
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={() => handleLoad(chart)}
                                style={{
                                    padding: '6px 12px',
                                    background: 'var(--primary-purple)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Load
                            </button>
                            <button
                                onClick={() => handleDelete(chart.id)}
                                style={{
                                    padding: '6px 12px',
                                    background: '#f44336',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
