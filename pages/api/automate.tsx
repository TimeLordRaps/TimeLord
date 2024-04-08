import { NextApiRequest, NextApiResponse } from 'next';
import { chromium } from 'playwright';
import { basicActions, executeCustomScript } from '../../utils/browserActions';

export default async function handler(req, res) {
    const { url, actions } = req.body;

    try {
        const browser = await chromium.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto(url);

        for (let action of actions) {
            if (action.type === 'script') {
                // Evaluate custom script directly on the page
                await executeCustomScript(page, action.script);
            } else {
                // Execute predefined actions
                const act = basicActions[action.name];
                if (act) {
                    await act(page, action.selector);
                }
            }
        }

        await browser.close();
        res.status(200).json({ message: 'Automation completed successfully' });
    } catch (error) {
        console.error('Automation error:', error);
        res.status(500).json({ error: error.message });
    }
}
