import React, { useState } from 'react';

const Browser = () => {
    const [url, setUrl] = useState('');
    const [script, setScript] = useState('');

    const handleRunAutomation = async () => {
        const actions = [
            { name: 'navigate', selector: url },
            { type: 'script', script: script } // Custom script
        ];

        await fetch('/api/automate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, actions })
        });
    };

    return (
        <div>
            <input 
                type="text" 
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="Enter URL"
            />
            <textarea
                value={script}
                onChange={e => setScript(e.target.value)}
                placeholder="Enter custom script"
            />
            <button onClick={handleRunAutomation}>Run Automation</button>
        </div>
    );
};

export default Browser;
