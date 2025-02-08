"use client";

import { useState, useRef } from "react";

export default function HomePage() {
  // Component state for user input, loading status, progress, API result, and error
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Use a ref to keep track of the interval for updating the progress bar
  const progressInterval = useRef(null);
  // Set a maximum duration (in seconds) for the progress simulation.
  const maxDuration = 45;

  // Extract the last segment of the URL and append .mp4
  const getFileNameFromUrl = (inputUrl) => {
    try {
      const parsedUrl = new URL(inputUrl);
      const segments = parsedUrl.pathname.split("/").filter(Boolean);
      const lastSegment = segments[segments.length - 1] || "video";
      return `${lastSegment}.mp4`;
    } catch (err) {
      return "video.mp4";
    }
  };

  // Start a simulated progress bar
  const startProgress = () => {
    setProgress(0);
    let secondsPassed = 0;
    progressInterval.current = setInterval(() => {
      secondsPassed += 1;
      // Calculate progress percentage based on maxDuration seconds
      const percent = (secondsPassed / maxDuration) * 100;
      setProgress(percent);
      if (secondsPassed >= maxDuration) {
        clearInterval(progressInterval.current);
      }
    }, 1000);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset states and start the progress simulation
    setLoading(true);
    setError(null);
    setResult(null);
    startProgress();

    try {
      const response = await fetch("https://slots-server.kasra.codes/download-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Send the URL in the body as JSON
        body: JSON.stringify({ url }),
      });

      // Parse the JSON response
      const data = await response.json();

      // Stop the progress simulation and mark progress as complete
      clearInterval(progressInterval.current);
      setProgress(100);
      setLoading(false);

      // If the API returned an error key, update our error state
      if (data.error) {
        setError(`${data.error}: ${data.message}`);
      } else {
        // Otherwise, save the successful response
        setResult(data);
      }
    } catch (err) {
      // In case of a network error or unexpected exception
      clearInterval(progressInterval.current);
      setLoading(false);
      setError("An error occurred: " + err.message);
    }
  };

  const handleDownload = async (videoUrl) => {
    const filename = getFileNameFromUrl(videoUrl);
    const downloadUrl = `/api/download?videoUrl=${encodeURIComponent(videoUrl)}&filename=${encodeURIComponent(filename)}`;
    window.location.href = downloadUrl;
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "2rem",
        fontFamily: "Arial, sans-serif",
        minHeight: "100vh",
        textAlign: "center",
      }}
    >
      <h1>Farcaster Video Downloader</h1>
      <form
        onSubmit={handleSubmit}
        style={{ marginTop: "1rem", marginBottom: "1rem", width: "100%", maxWidth: "500px" }}
      >
        <label
          style={{
            display: "block",
            marginBottom: "0.5rem",
            fontSize: "1.1rem",
          }}
        >
          Farcaster URL:
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter Farcaster URL here"
            style={{
              marginLeft: "0.5rem",
              padding: "0.5rem",
              width: "calc(100% - 1rem)",
              fontSize: "1rem",
            }}
            required
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "0.5rem 1rem",
            fontSize: "1rem",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Processing..." : "Submit"}
        </button>
      </form>

      {loading && (
        <div style={{ marginBottom: "1rem", width: "100%", maxWidth: "500px" }}>
          <progress value={progress} max="100" style={{ width: "100%" }} />
          <p>Processing: {Math.round(progress)}%</p>
        </div>
      )}

      {error && (
        <div style={{ marginTop: "1rem", color: "red" }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && !error && (
        <div style={{ marginTop: "1rem" }}>
          <p>Click the button below to download your video:</p>
          <button
            onClick={() => handleDownload(result.url)}
            style={{
              padding: "0.5rem 1rem",
              fontSize: "1rem",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              marginTop: "1rem"
            }}
          >
            Download Video
          </button>
        </div>
      )}
    </div>
  );
}
