export default function Button({ text }) {
  return (
    <button className="text-white bg-indigo-600 hover:bg-indigo-700 transition px-6 py-3 rounded-xl text-sm">
      {text}
    </button>
  )
}
