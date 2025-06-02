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
  const [promptMode, setPromptMode] = useState(false);
  const [editablePrompt, setEditablePrompt] = useState('');

  const buildPrompt = (data) => {
    return `You are an AI greeting card designer. Based on the following structured input, generate a detailed visual prompt for an AI-generated greeting card image. Then create the image. The result should be a beautifully composed card front design based on the tone, style, and occasion described.

Occasion: ${data.Occasion}
Relationship to recipient: ${data.Relationship}
Vibe or tone: ${data.Tone}
Imagery suggestions: ${data.Imagery}
Color palette/style: ${data.ColorPalette}
Front text: ${data.FrontText}
Inside message: ${data.InsideText}
Extra notes: ${data.OtherNotes}`;
  };

  const handleNext = async () => {
    const key = questions[step].key;
    const updated = { ...inputs, [key]: inputValue };
    setInputs(updated);
    setInputValue('');

    if (/create my card/i.test(inputValue) || step === questions.length - 1) {
      const promptText = buildPrompt(updated);
      setEditablePrompt(promptText);
      setPromptMode(true);
    } else {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
      const prevKey = questions[step - 1].key;
      setInputValue(inputs[prevKey] || '');
    }
  };

  const handleRestart = () => {
    setStep(0);
    setInputs({});
    setInputValue('');
    setImageUrl('');
    setEditablePrompt('');
    setPromptMode(false);
    setLoading(false);
  };

  const handleGenerate = async () => {
    setPromptMode(false);
    setLoading(true);
    const response = await fetch('/api/generate-card', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inputs),
    });
    const data = await response.json();
    setImageUrl(data.imageUrl);
    setLoading(false);
  };

  const currentQuestion = questions[step];

  return (
    <div className="max-w-xl mx-auto mt-10 p-4">
      {promptMode && (
        <>
          <h2 className="text-lg font-semibold mb-2">📝 Review & Edit Prompt</h2>
          <textarea
            className="w-full border p-3 h-64 mb-4"
            value={editablePrompt}
            onChange={(e) => setEditablePrompt(e.target.value)}
          />
          <div className="flex gap-3">
            <button
              onClick={handleGenerate}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Generate Card
            </button>
            <button
              onClick={() => setPromptMode(false)}
              className="bg-gray-300 text-black px-4 py-2 rounded"
            >
              Go Back
            </button>
          </div>
        </>
      )}

      {!imageUrl && !promptMode && (
        <>
          <div className="text-lg font-semibold mb-2">🎉 AI Greeting Card Designer</div>
          <div className="text-sm text-gray-600 mb-1">Step {step + 1} of {questions.length}</div>

          <div className="mb-4">
            {step === 0 ? (
              <p>Hi! I’ll help you create a custom greeting card. Just type something to get started!</p>
            ) : (
              <p>{currentQuestion.prompt}</p>
            )}
          </div>

          <div className="bg-gray-100 p-3 rounded mb-4 text-sm">
            <h3 className="font-medium mb-2">Your Answers:</h3>
            <ul className="list-disc list-inside space-y-1">
              {questions.map((q, i) =>
                i < step && inputs[q.key] ? (
                  <li key={q.key}>
                    <strong>{q.prompt}</strong> — {inputs[q.key]}
                  </li>
                ) : null
              )}
            </ul>
          </div>

          <input
            className="border p-2 w-full mb-3"
            placeholder="Type your answer..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleNext()}
          />

          <div className="flex gap-3">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded"
              onClick={handleNext}
              disabled={loading}
            >
              Next
            </button>
            <button
              className="bg-gray-300 text-black px-4 py-2 rounded"
              onClick={handleBack}
              disabled={step === 0}
            >
              Back
            </button>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded"
              onClick={handleRestart}
            >
              Restart
            </button>
          </div>
        </>
      )}

      {loading && <p className="mt-4 animate-pulse text-gray-500">🖌️ Generating your card...</p>}

      {imageUrl && (
        <div className="mt-4 text-center">
          <h2 className="font-bold text-xl mb-2">🎉 Here's your custom card!</h2>
          <img src={imageUrl} alt="Generated Greeting Card" className="rounded-lg shadow-lg max-w-full" />
          <div className="mt-4">
            <button
              onClick={handleRestart}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              Create Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
