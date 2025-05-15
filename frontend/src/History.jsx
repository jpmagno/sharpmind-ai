import { useState, useEffect } from "react"

function History() {
  const [sessions, setSessions] = useState([])
  const [showDetails, setShowDetails] = useState([])
  const [search, setSearch] = useState("")
  const [sortOrder, setSortOrder] = useState("newest")
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem("sharpmind_theme")
    if (savedTheme === "dark") {
      setDarkMode(true)
      document.body.classList.add("dark")
    }
  }, [])

  const toggleDarkMode = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    localStorage.setItem("sharpmind_theme", newMode ? "dark" : "light")

    if (newMode) {
      document.body.classList.add("dark")
    } else {
      document.body.classList.remove("dark")
    }
  }

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("sharpmind_sessions") || "[]")
    setSessions(saved)
    setShowDetails(new Array(saved.length).fill(false))
  }, [])

  const deleteSession = (index) => {
    const updated = [...sessions]
    updated.splice(index, 1)
    setSessions(updated)
    localStorage.setItem("sharpmind_sessions", JSON.stringify(updated))

    const details = [...showDetails]
    details.splice(index, 1)
    setShowDetails(details)
  }

  const toggleDetails = (index) => {
    const updated = [...showDetails]
    updated[index] = !updated[index]
    setShowDetails(updated)
  }

  const downloadSession = (data, index) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `session_${index + 1}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleImport = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const newSession = JSON.parse(event.target.result)
        const sessions = JSON.parse(localStorage.getItem("sharpmind_sessions") || "[]")
        sessions.push(newSession)
        localStorage.setItem("sharpmind_sessions", JSON.stringify(sessions))
        setSessions(sessions)
        setShowDetails(new Array(sessions.length).fill(false))
      } catch {
        alert("Invalid JSON format.")
      }
    }
    reader.readAsText(file)
  }

  const copyText = (text) => {
    navigator.clipboard.writeText(text)
    alert("Copied to clipboard!")
  }

  const filtered = [...sessions]
    .filter((item) =>
      item.summary.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (SortOrder === "newest") {
        return new Date(b.createdAt) - new Date(a.createdAt)
      } else if (sortOrder === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt)
      } else if (sortOrder === "tag-az") {
        return (a.tag || "").localeCompare(b.tag || "")
      } else if (sortOrder === "tag-za") {
        return (b.tag || "").localeCompare(a.tag || "")
      }
      return 0
    })

  const editTag = (index) => {
    const newTag = prompt("Enter a new tag:")
    if (newTag === null) return
    
    const updated = [...sessions]
    updated[index].tag = newTag
    setSessions(updated)
    localStorage.setItem("sharpmind_sessions", JSON.stringify(updated))
  }

  const clearAll = () => {
    const confirmClear = window.confirm("Are you sure you want to delete all history?")
    if (!confirmClear) return

    localStorage.removeItem("sharpmind_sessions")
    setSessions([])
    setShowDetails([])
  }

  const downloadAllSessions = () => {
    if (sessions.length === 0) {
        alert("No sessions to download.")
        return
    }

    const blob = new Blob([JSON.stringify(sessions, null, 2)], {
        type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'sharpmind_sessions_backup.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleRestoreAll = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
        try {
            const imported = JSON.parse(event.target.result)
            if (!Array.isArray(imported)) {
                alert("Invalid backup format. Expected an array.")
                return
            }
            localStorage.setItem("sharpmind_sessions", JSON.stringify(imported))
            setSessions(imported)
            setShowDetails(new Array(imported.length).fill(false))
            alert("Backup restored successfully.")
        } catch {
            alert("Failed to restore. File is not valid JSON.")
        }
    }
    reader.readAsText(file)
  }

return (
  <div className="p-8 max-w-3xl mx-auto bg-white dark:bg-gray-900 text-black dark:text-white min-h-screen">
    <h1 className="text-3xl font-bold mb-6">Summary History</h1>

    <button
      onClick={toggleDarkMode}
      className="mb-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
    >
      {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
    </button>
  
    <button
      onClick={clearAll}
      className="mb-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
    >
      Clear All History
    </button>

    <button
      onClick={downloadAllSessions}
      className="mb-4 ml-4 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
    >
      Download All Sessions
    </button>

    <label className="mb-4 ml-4 block text-sm font-medium text-gray-700">
      Restore from Backup:
      <input
        type="file"
        accept=".json"
        onChange={handleRestoreAll}
        className="mt-1"
      />
    </label>

   
    <div className="mb-4">
      <label className="font-medium mr-2">Sort by:</label>
      <select
        value={sortOrder}
        onChange={(e) => setSortOrder(e.target.value)}
        className="border p-2 rounded"
      >
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
        <option value="tag-az">Tag A-Z</option>
        <option value="tag-za">Tag Z-A</option>
      </select>
    </div>

    
    <div className="mb-4 flex gap-4 items-center">
      <input
        type="text"
        placeholder="Search summaries..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border p-2 rounded w-full"
      />
      <input
        type="file"
        accept=".json"
        onChange={handleImport}
        className="block"
      />
    </div>

    
    {filtered.length === 0 ? (
      <p>No saved sessions.</p>
    ) : (
      <ul className="space-y-4">
        {filtered.map((item, idx) => (
          <li key={idx} className="bg-white p-4 rounded shadow">
            <div className="flex justify-between items-start">
              <div className="w-full">
                <p className="text-sm text-gray-500 mb-1">
                  Saved on {new Date(item.createdAt).toLocaleString()}
                </p>

                {item.tag && (
                  <div className="mb-1">
                    <p className="text-sm text-indigo-500 italic">
                      Tag: {item.tag}
                    </p>
                    <button
                      onClick={() => editTag(idx)}
                      className="text-sm text-blue-500 underline ml-2"
                    >
                      Edit Tag
                    </button>
                  </div>
                )}

                <p className="font-semibold mb-1">Summary:</p>
                <p>{item.summary}</p>
                <button
                  onClick={() => copyText(item.summary)}
                  className="text-sm text-blue-600 underline mt-1"
                >
                  Copy Summary
                </button>

                <button
                  onClick={() => toggleDetails(idx)}
                  className="text-sm text-green-600 underline mt-3 block"
                >
                  {showDetails[idx] ? "Hide Details" : "View Details"}
                </button>

                {showDetails[idx] && (
                  <div className="mt-3 space-y-3">
                    <div>
                      <h4 className="font-semibold">Flashcards:</h4>
                      {item.flashcards?.map((fc, i) => (
                        <div key={i} className="pl-2">
                          <p><strong>Q:</strong> {fc.question}</p>
                          <p><strong>A:</strong> {fc.answer}</p>
                          <button
                            onClick={() =>
                              copyText(`Q: ${fc.question}\nA: ${fc.answer}`)
                            }
                            className="text-sm text-blue-600 underline"
                          >
                            Copy Card
                          </button>
                        </div>
                      ))}
                    </div>

                    <div>
                      <h4 className="font-semibold">Quiz:</h4>
                      {item.quiz?.map((q, i) => (
                        <div key={i} className="pl-2">
                          <p><strong>{q.question}</strong></p>
                          <ul className="list-disc ml-5">
                            {q.options?.map((opt, j) => (
                              <li key={j}>{opt}</li>
                            ))}
                          </ul>
                          <button
                            onClick={() =>
                              copyText(`Q: ${q.question}\nOptions: ${q.options.join(', ')}`)
                            }
                            className="text-sm text-blue-600 underline"
                          >
                            Copy Quiz
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-end gap-2">
                <button
                  onClick={() => deleteSession(idx)}
                  className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
                <button
                  onClick={() => downloadSession(item, idx)}
                  className="px-3 py-1 text-sm bg-gray-300 text-black rounded hover:bg-gray-400"
                >
                  Download
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    )}
  </div>
)
}


export default History
