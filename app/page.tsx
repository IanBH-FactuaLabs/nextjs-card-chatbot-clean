'use client';
import { useState } from 'react';

const questions = [
  { key: 'Occasion', prompt: "🎉 What’s the occasion?" },
  { key: 'Relationship', prompt: "🤝 What’s your relationship to the recipient?" },
  { key: 'Tone', prompt: "🎨 What vibe do you want the card to have?" },
  { key: 'Imagery', prompt: "🖼️ Any specific images on the front?" },
  { key: 'ColorPalette', prompt: "🎨 Preferred color palette or style?" },
  { key: 'FrontText', prompt: "📝 What should the card say on the front?" },
  { key: 'InsideText', prompt: "💌 What should the inside message be?" },
  { key: 'OtherNotes', prompt: "📌 Anything else you'd like to add? Say 'create my card' when ready." },
];

export default function Page() {
  const [step, setStep] = useState(0);
  const [inputs, setInputs] = useState({});
  const [inputValue, setInputValue] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    const key = questions[step].key;
    const updated = { ...inputs, [key]: inputValue };
    setInputs(updated);
    setInputValue('');

    if (/create my card/i.test(inputValue) || step === questions.length - 1) {
      setLoading(true);
      const response = await fetch('/api/generate-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      const data = await response.json();
      setImageUrl(data.imageUrl);
      setLoading(false);
    } else {
      setStep((prev) => prev + 1);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-4">
      {!imageUrl && (
        <>
          <div className="text-lg font-semibold mb-2">🎉 AI Greeting Card Designer</div>
          <p className="mb-4">
            {step === 0
              ? 'Hi! I’ll help you create a custom greeting card. Just type something to get started!'
              : questions[step].prompt}
          </p>
          <input
            className="border p-2 w-full mb-3"
            placeholder="Type your answer..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleNext()}
          />
          <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleNext} disabled={loading}>
            Next
          </button>
        </>
      )}
      {loading && <p className="mt-4">🖌️ Generating your card...</p>}
      {imageUrl && (
        <div className="mt-4 text-center">
          <h2 className="font-bold text-xl mb-2">🎉 Here's your custom card!</h2>
          <img src={imageUrl} alt="Generated Greeting Card" className="rounded-lg shadow-lg max-w-full" />
        </div>
      )}
    </div>
  );
}
