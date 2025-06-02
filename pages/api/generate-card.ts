import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const {
    Occasion,
    Relationship,
    Tone,
    Imagery,
    ColorPalette,
    FrontText,
    InsideText,
    OtherNotes,
  } = req.body;

  const prompt = `You are an AI greeting card designer. Based on the following structured input, generate a detailed visual prompt for an AI-generated greeting card image. Then create the image. The result should be a beautifully composed card front design based on the tone, style, and occasion described.

Occasion: ${Occasion}
Relationship to recipient: ${Relationship}
Vibe or tone: ${Tone}
Imagery suggestions: ${Imagery}
Color palette/style: ${ColorPalette}
Front text: ${FrontText}
Inside message: ${InsideText}
Extra notes: ${OtherNotes}`;

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt,
        size: '1024x1024',
        n: 1,
      }),
    });

    const json = await openaiRes.json();
    const imageUrl = json.data?.[0]?.url;

    if (!imageUrl) return res.status(500).json({ error: 'Image generation failed.' });

    res.status(200).json({ imageUrl });
  } catch (error) {
    console.error('Image generation error:', error);
    res.status(500).json({ error: 'Unexpected error.' });
  }
}
