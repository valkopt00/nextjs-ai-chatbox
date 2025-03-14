export default function Button({ text, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-3 rounded-md transition-all duration-200 shadow-md ${
        disabled
          ? "bg-gray-600 cursor-not-allowed opacity-50"
          : "bg-gray-900 text-white"
      }`}
    >
      {text}
    </button>
  );
}