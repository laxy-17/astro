
import React from 'react';

interface Props {
    ayanamsa: string;
    onAyanamsaChange: (val: string) => void;
}

export const ControlPanel: React.FC<Props> = ({
    ayanamsa,
    onAyanamsaChange
}) => {
    return (
        <div className="panel" style={{ padding: '12px', display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
                <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#555' }}>Ayanamsa</span>
                <select
                    value={ayanamsa}
                    onChange={(e) => onAyanamsaChange(e.target.value)}
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }}
                >
                    <option value="LAHIRI">Lahiri (Default)</option>
                    <option value="RAMAN">Raman</option>
                    <option value="KRISHNAMURTI">KP System</option>
                    <option value="FAGAN_BRADLEY">Fagan-Bradley</option>
                    <option value="SAYANA">Tropical (Sayana)</option>
                </select>
            </div>
        </div>
    );
};
