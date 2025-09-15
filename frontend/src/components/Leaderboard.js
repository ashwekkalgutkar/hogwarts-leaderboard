import React from "react";
import "./Leaderboard.css";

const Leaderboard = ({ data, timeWindow, isLoading, isLiveUpdates }) => {
  // House colors and icons
  const houseConfig = {
    Gryff: {
      name: "Gryffindor",
      color: "#d4af37",
      bgColor: "linear-gradient(135deg, #740001, #ae0001)",
      icon: "🦁",
      textColor: "#ffd700",
    },
    Slyth: {
      name: "Slytherin",
      color: "#1a472a",
      bgColor: "linear-gradient(135deg, #1a472a, #2d5a3d)",
      icon: "🐍",
      textColor: "#90ee90",
    },
    Raven: {
      name: "Ravenclaw",
      color: "#0e1a40",
      bgColor: "linear-gradient(135deg, #0e1a40, #1e3a5f)",
      icon: "🦅",
      textColor: "#87ceeb",
    },
    Huff: {
      name: "Hufflepuff",
      color: "#ecb939",
      bgColor: "linear-gradient(135deg, #ecb939, #f4d03f)",
      icon: "🦡",
      textColor: "#2c3e50",
    },
  };

  const getTimeWindowText = () => {
    switch (timeWindow) {
      case "5min":
        return "Last 5 Minutes";
      case "1hour":
        return "Last Hour";
      case "all":
        return "All Time";
      default:
        return "All Time";
    }
  };

  const getRankSuffix = (rank) => {
    if (rank === 1) return "st";
    if (rank === 2) return "nd";
    if (rank === 3) return "rd";
    return "th";
  };

  if (isLoading) {
    return (
      <div className="leaderboard-container">
        <div className="leaderboard-header">
          <h2>🏆 House Cup Standings</h2>
          <p className="time-window-text">{getTimeWindowText()}</p>
        </div>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading magical standings...</p>
        </div>
      </div>
    );
  }

  const maxPoints = Math.max(...data.map((house) => house.points), 1);

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h2>🏆 House Cup Standings</h2>
        <p className="time-window-text">{getTimeWindowText()}</p>
        {isLiveUpdates && (
          <div className="live-indicator">
            <span className="live-dot"></span>
            LIVE
          </div>
        )}
      </div>

      <div className="leaderboard-grid">
        {data.map((house, index) => {
          const config = houseConfig[house.house];
          const rank = index + 1;
          const percentage = (house.points / maxPoints) * 100;

          return (
            <div
              key={house.house}
              className={`house-card rank-${rank}`}
              style={{ "--house-bg": config.bgColor }}
            >
              <div className="house-card-inner">
                <div className="rank-badge">
                  {rank}
                  <sup>{getRankSuffix(rank)}</sup>
                </div>

                <div className="house-icon">{config.icon}</div>

                <div className="house-info">
                  <h3
                    className="house-name"
                    style={{ color: config.textColor }}
                  >
                    {config.name}
                  </h3>

                  <div className="points-display">
                    <span className="points-number">
                      {house.points.toLocaleString()}
                    </span>
                    <span className="points-label">points</span>
                  </div>

                  <div className="events-count">
                    {house.events} event{house.events !== 1 ? "s" : ""}
                  </div>
                </div>

                <div className="points-bar-container">
                  <div
                    className="points-bar"
                    style={{
                      width: `${percentage}%`,
                      background: config.bgColor,
                      boxShadow: `0 0 20px ${config.color}40`,
                    }}
                  >
                    <div className="points-bar-glow"></div>
                  </div>
                </div>

                {rank === 1 && house.points > 0 && (
                  <div className="winner-crown">👑</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {data.length === 0 || data.every((house) => house.points === 0) ? (
        <div className="no-data-message">
          <p>🔮 No house points awarded yet in this time period</p>
          <p className="sub-text">The competition awaits...</p>
        </div>
      ) : (
        <div className="leaderboard-stats">
          <div className="total-points">
            Total Points Awarded:{" "}
            <strong>
              {data
                .reduce((sum, house) => sum + house.points, 0)
                .toLocaleString()}
            </strong>
          </div>
          <div className="total-events">
            Total Events:{" "}
            <strong>
              {data
                .reduce((sum, house) => sum + house.events, 0)
                .toLocaleString()}
            </strong>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
