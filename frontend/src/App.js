import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import Leaderboard from "./components/Leaderboard";
import "./App.css";
const API_URL = process.env.NODE_ENV === 'production' 
  ? process.env.REACT_APP_API_URL : "http://localhost:5000";


function App() {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [timeWindow, setTimeWindow] = useState("all");
  const [isLiveUpdates, setIsLiveUpdates] = useState(true);
  const [socket, setSocket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("connecting");

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(API_URL, {
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      console.log("Connected to server");
      setConnectionStatus("connected");
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from server");
      setConnectionStatus("disconnected");
    });

    newSocket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      setConnectionStatus("error");
    });

    newSocket.on("newPoints", (data) => {
      if (isLiveUpdates) {
        console.log("New points received:", data);
        setLastUpdate(new Date());
        fetchLeaderboardData(); // Refresh the leaderboard
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [isLiveUpdates]);

  // Fetch leaderboard data
  const fetchLeaderboardData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${API_URL}/api/leaderboard?timeWindow=${timeWindow}`
      );
      const data = await response.json();

      if (data.success) {
        setLeaderboardData(data.leaderboard);
        setLastUpdate(new Date());
      } else {
        console.error("Failed to fetch leaderboard data:", data.error);
      }
    } catch (error) {
      console.error("Error fetching leaderboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when time window changes
  useEffect(() => {
    fetchLeaderboardData();
  }, [timeWindow]);

  // Initial data fetch
  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const handleTimeWindowChange = (newTimeWindow) => {
    setTimeWindow(newTimeWindow);
  };

  const toggleLiveUpdates = () => {
    setIsLiveUpdates(!isLiveUpdates);
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "#10b981"; // green
      case "disconnected":
        return "#ef4444"; // red
      case "error":
        return "#f59e0b"; // yellow
      default:
        return "#6b7280"; // gray
    }
  };

  return (
    <div className="App">
      <div className="hogwarts-bg">
        <header className="app-header">
          <div className="header-content">
            <h1 className="main-title">🏰 Live Leaderboard</h1>
            <div className="status-bar">
              <div className="connection-status">
                <div
                  className="status-dot"
                  style={{ backgroundColor: getConnectionStatusColor() }}
                ></div>
                <span className="status-text">
                  {connectionStatus === "connected"
                    ? "Connected"
                    : connectionStatus === "disconnected"
                    ? "Disconnected"
                    : connectionStatus === "error"
                    ? "Connection Error"
                    : "Connecting..."}
                </span>
              </div>
              {lastUpdate && (
                <div className="last-update">
                  Last update: {lastUpdate.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>

          <div className="controls">
            <div className="time-controls">
              <button
                className={`time-btn ${timeWindow === "5min" ? "active" : ""}`}
                onClick={() => handleTimeWindowChange("5min")}
              >
                5 Minutes
              </button>
              <button
                className={`time-btn ${timeWindow === "1hour" ? "active" : ""}`}
                onClick={() => handleTimeWindowChange("1hour")}
              >
                1 Hour
              </button>
              <button
                className={`time-btn ${timeWindow === "all" ? "active" : ""}`}
                onClick={() => handleTimeWindowChange("all")}
              >
                All Time
              </button>
            </div>

            <button
              className={`live-update-btn ${isLiveUpdates ? "active" : ""}`}
              onClick={toggleLiveUpdates}
            >
              {isLiveUpdates ? "⏸️ Stop Updates" : "▶️ Start Updates"}
            </button>
          </div>
        </header>

        <main className="main-content">
          <Leaderboard
            data={leaderboardData}
            timeWindow={timeWindow}
            isLoading={isLoading}
            isLiveUpdates={isLiveUpdates}
          />
        </main>

        <footer className="app-footer">
          <p>🧙‍♂️ Hogwarts House Cup Competition 🏆</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
