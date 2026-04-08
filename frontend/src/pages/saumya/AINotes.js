import React, { useState, useEffect } from 'react';
import { fetchAvailableModules } from '../../utils/moduleApi';

function AINotes() {
  const [userInput, setUserInput] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [modules, setModules] = useState([]);
  const [generatedNotes, setGeneratedNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const loadModules = async () => {
      try {
        const data = await fetchAvailableModules();
        setModules(data);
      } catch (error) {
        console.error('Failed to load modules:', error);
      }
    };
    loadModules();
  }, []);

  const generateNotes = async () => {
    if (!userInput.trim() || !selectedModule) {
      alert('Please enter some text and select a module.');
      return;
    }

    setIsGenerating(true);
    try {
      // Mock AI note generation - in real implementation, this would call an AI API
      const notes = await mockAINoteGeneration(userInput, selectedModule);
      setGeneratedNotes(notes);
    } catch (error) {
      console.error('Failed to generate notes:', error);
      alert('Failed to generate notes. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const mockAINoteGeneration = async (input, module) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simple mock AI logic - extract key points and summarize
    const sentences = input.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const keyPoints = sentences.slice(0, 5).map(s => `• ${s.trim()}`);

    return `# AI-Generated Notes for ${module}

## Summary
${input.substring(0, 200)}${input.length > 200 ? '...' : ''}

## Key Points
${keyPoints.join('\n')}

## Study Tips
• Review these notes regularly
• Connect concepts to real-world applications
• Practice explaining these concepts to others

*Generated on ${new Date().toLocaleDateString()}*`;
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
      {/* Header Section */}
      <div
        style={{
          background: "linear-gradient(135deg, #ff6a00 0%, #f25c05 55%, #d5541b 100%)",
          borderRadius: "24px",
          padding: "28px 32px",
          position: "relative",
          overflow: "hidden",
          minHeight: "165px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          marginBottom: "30px",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -40,
            right: -40,
            width: "220px",
            height: "220px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.10)",
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: -55,
            right: 100,
            width: "160px",
            height: "160px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
          }}
        />

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            background: "rgba(255,255,255,0.14)",
            color: "#fff",
            padding: "10px 14px",
            borderRadius: "14px",
            width: "fit-content",
            marginBottom: "14px",
            position: "relative",
            zIndex: 1,
          }}
        >
          <span
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "8px",
              background: "rgba(255,255,255,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
            }}
          >
            ✨
          </span>
          <span
            style={{
              fontSize: "13px",
              fontWeight: "800",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            AI-Powered
          </span>
        </div>

        <h1
          style={{
            margin: "0 0 10px 0",
            color: "#fff",
            fontSize: "28px",
            fontWeight: "800",
            position: "relative",
            zIndex: 1,
          }}
        >
          AI Notes
        </h1>

        <p
          style={{
            margin: 0,
            color: "rgba(255,255,255,0.92)",
            fontSize: "14px",
            lineHeight: "1.7",
            maxWidth: "760px",
            position: "relative",
            zIndex: 1,
          }}
        >
          Generate smart notes, summarize learning materials, and organize key
          concepts with AI assistance to make studying easier and faster.
        </p>
      </div>

      {/* Note Creator Section */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
        {/* Input Section */}
        <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
          <h2 style={{ margin: "0 0 20px 0", color: "#333", fontSize: "20px", fontWeight: "600" }}>
            Create Notes
          </h2>

          {/* Module Selector */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#555" }}>
              Select Module
            </label>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "14px",
                background: "#fff",
              }}
            >
              <option value="">Choose a module...</option>
              {modules.map(module => (
                <option key={module._id} value={module.name}>
                  {module.name}
                </option>
              ))}
            </select>
          </div>

          {/* Text Input */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#555" }}>
              Enter your study material or notes
            </label>
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Paste your lecture notes, textbook content, or any study material here..."
              style={{
                width: "100%",
                minHeight: "200px",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "14px",
                fontFamily: "inherit",
                resize: "vertical",
              }}
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={generateNotes}
            disabled={isGenerating || !userInput.trim() || !selectedModule}
            style={{
              width: "100%",
              padding: "14px",
              background: isGenerating ? "#ccc" : "linear-gradient(135deg, #ff6a00 0%, #f25c05 100%)",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: isGenerating ? "not-allowed" : "pointer",
              transition: "all 0.2s",
            }}
          >
            {isGenerating ? "Generating Notes..." : "Generate AI Notes"}
          </button>
        </div>

        {/* Output Section */}
        <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
          <h2 style={{ margin: "0 0 20px 0", color: "#333", fontSize: "20px", fontWeight: "600" }}>
            Generated Notes
          </h2>

          {generatedNotes ? (
            <div
              style={{
                background: "#f8f9fa",
                borderRadius: "8px",
                padding: "16px",
                minHeight: "300px",
                whiteSpace: "pre-wrap",
                fontFamily: "monospace",
                fontSize: "14px",
                lineHeight: "1.6",
                border: "1px solid #e9ecef",
              }}
            >
              {generatedNotes}
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "300px",
                color: "#999",
                fontSize: "16px",
                textAlign: "center",
              }}
            >
              Your AI-generated notes will appear here
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AINotes;