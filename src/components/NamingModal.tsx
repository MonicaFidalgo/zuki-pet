import { useState } from "react";

interface NamingModalProps {
  submitName: (name: string) => void;
}

export function NamingModal({ submitName }: NamingModalProps) {
  const [inputValue, setInputValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    submitName(inputValue.trim());
  }

  const isDisabled = inputValue.trim() === "";

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-10">
      <div className="bg-white rounded-xl p-8 shadow-xl w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4">Name your pet</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="pet-name" className="block mb-2 font-medium">
            What will you call your fox?
          </label>
          <input
            id="pet-name"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
            autoFocus
          />
          <button
            type="submit"
            disabled={isDisabled}
            className="w-full bg-orange-400 text-white font-semibold py-2 rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-orange-500 transition-colors"
          >
            Let&apos;s go!
          </button>
        </form>
      </div>
    </div>
  );
}
