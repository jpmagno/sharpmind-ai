import { useState, useEffect } from 'react'
import Summary from './Summary'
import Flashcards from './Flashcards'
import Quiz from './Quiz'
import { Link } from 'react-router-dom'

function App() {
  const [content, setContent] = useState("")
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [mode, setMode] = useState("text")
  const [preview, setPreview] = useState("")
  const [readyToSummarize, setReadyToSummarize] = useState(false)

  useEffect(() => {
    const savedResult = localStorage.getItem("sharpmind_result")
    if (savedResult) {
      setResult(JSON.parse(savedResult))
    }
  }, [])

  const extractOrUpload = async () => {
    let extractedContent = content

    if (mode === "link") {
      const extractRes = await fetch("http://localhost:8000/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: content })
      })

      const extractData = await extractRes.json()
      if (!extractRes.ok) throw new Error(extractData.detail || "Extraction failed")
        
      extractedContent = extractData.content
    }

    setPreview(extractedContent)
    setReadyToSummarize(true)
  }

  const summarize = async () => {
    const res = await fetch("http://localhost:8000/api/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: preview })
    })

    const data = await res.json()
    if (data.error) throw new Error(data.error)
    
    setResult(data)
    localStorage.setItem("sharpmind_result", JSON.stringify(data))

      const sessions = JSON.parse(localStorage.getItem("sharpmind_sessions") || "[]")
      const session = {...data, createdAt: new Date().toISOString() }
      const updated = [session, ...sessions]
      localStorage.setItem("sharpmind_sessions", JSON.stringify(updated))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    setResult(null)
    setReadyToSummarize(false)

    try {
      if (mode === "text") {
        setPreview(content)
        setReadyToSummarize(true)
      } else {
        await extractOrUpload()
      }
    } catch(err) {
      setError("Something went wrong. Try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    localStorage.removeItem("sharpmind_result")
    setResult(null)
    setContent("")
  }

  return (
    <div className="p-8 max-w-3xl mx-auto font-sans">
      <h1 className="text-4xl font-bold text-blue-600 mb-6">SharpMind AI</h1>

      <Link to="/history" className="text-blue-600 hover:underline block mb-4">View History</Link>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label className="mr-4 font-medium">Input Mode:</label>
          <select value={mode} onChange={(e) => setMode(e.target.value)} className="border p-2 rounded">
            <option value="text">Paste Text</option>
            <option value="link">Paste Link</option>
          </select>
        </div>

        <textarea
          rows="8"
          cols="80"
          placeholder={mode === "link" ? "Paste YouTube or article link here..." : "Paste your article here..."}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          className="w-full p-3 border border-gray-300 rounded mb-4"
        />
        <div className="flex gap-4">
          <button 
            type="submit" 
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {loading ? "Processing..." : "Submit"}
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
          >
            Clear
          </button>
        </div>
      </form>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {readyToSummarize && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Preview / Edit Extracted Content:</h3>
          <textarea
            rows="8"
            value={preview}
            onChange={(e) => setPreview(e.target.value)}
            className="w-full p-3 border border-blue-400 rounded text-gray-800 mb-2"
          />
          <button
            onClick={summarize}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Approve & Summarize
          </button>
        </div>
      )}

      {result && (
        <div className="space-y-6">
          <Summary summary={result.summary} />
          <Flashcards cards={result.flashcards} />
          <Quiz questions={result.quiz} />
        </div>
      )}
    </div>
  )
}

export default App
