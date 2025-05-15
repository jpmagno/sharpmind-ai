function Flashcards({ cards }) {
    return (
        <div>
            <h3 className="text-xl font-medium mb-2">Flashcards</h3>
            <ul className="space-y-2">
                {cards?.map((fc, i) => (
                    <li key={i} className="bg-white p-3 rounded shadow">
                        <strong>Q:</strong> {fc.question}<br />
                        <strong>A:</strong> {fc.answer}
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default Flashcards