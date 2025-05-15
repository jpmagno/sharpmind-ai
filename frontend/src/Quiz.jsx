function Quiz({ questions }) {
    return (
        <div>
            <h3 className="text-xl font-medium mb-2">Quiz</h3>
            <ul className="space-y-4">
                {questions?.map((q, i) => (
                    <li key={i} className="bg-white p-3 rounded shadow">
                        <p className="font-semibold">{q.question}</p>
                        <div className="ml-4 space-y-1">
                            {q.options?.map((opt, j) => (
                                <div key={j}>- {opt}</div>
                            ))}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default Quiz