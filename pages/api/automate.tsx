import { NextApiRequest, NextApiResponse } from 'next';
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url, script } = req.body;

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(url);

  const scriptFunction = new Function(script);
  await scriptFunction(page);

  const videoDir = path.join(process.cwd(), 'public', 'videos');
  if (!fs.existsSync(videoDir)) {
    fs.mkdirSync(videoDir);
  }

  const videoPath = path.join(videoDir, `automation-${Date.now()}.webm`);
  await page.video().saveAs(videoPath);

  await browser.close();

  res.status(200).json({ videoUrl: `/videos/${path.basename(videoPath)}` });
}