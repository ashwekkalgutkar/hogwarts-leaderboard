const express = require("express");
const HousePoint = require("../models/HousePoint");
const router = express.Router();

// Helper function to get time window filter
function getTimeFilter(timeWindow) {
  const now = new Date();
  let startTime;

  switch (timeWindow) {
    case "5min":
      startTime = new Date(now.getTime() - 5 * 60 * 1000); // 5 minutes ago
      break;
    case "1hour":
      startTime = new Date(now.getTime() - 60 * 60 * 1000); // 1 hour ago
      break;
    case "all":
    default:
      return {}; // No time filter for "all time"
  }

  return { timestamp: { $gte: startTime } };
}

// Get leaderboard data
router.get("/leaderboard", async (req, res) => {
  try {
    const { timeWindow = "all" } = req.query;
    const timeFilter = getTimeFilter(timeWindow);

    // Aggregate points by house
    const pipeline = [
      { $match: timeFilter },
      {
        $group: {
          _id: "$category",
          totalPoints: { $sum: "$points" },
          eventCount: { $sum: 1 },
        },
      },
      {
        $project: {
          house: "$_id",
          points: "$totalPoints",
          events: "$eventCount",
          _id: 0,
        },
      },
      { $sort: { points: -1 } },
    ];

    const results = await HousePoint.aggregate(pipeline);

    // Ensure all houses are represented, even with 0 points
    const houses = ["Gryff", "Slyth", "Raven", "Huff"];
    const leaderboard = houses.map((house) => {
      const houseData = results.find((r) => r.house === house);
      return {
        house,
        points: houseData ? houseData.points : 0,
        events: houseData ? houseData.events : 0,
      };
    });

    // Sort by points descending
    leaderboard.sort((a, b) => b.points - a.points);

    res.json({
      success: true,
      timeWindow,
      timestamp: new Date().toISOString(),
      leaderboard,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get recent events for debugging
router.get("/events/recent", async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const events = await HousePoint.find()
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .select("id category points timestamp -_id");

    res.json({
      success: true,
      events,
    });
  } catch (error) {
    console.error("Error fetching recent events:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get statistics
router.get("/stats", async (req, res) => {
  try {
    const totalEvents = await HousePoint.countDocuments();
    const totalPoints = await HousePoint.aggregate([
      { $group: { _id: null, total: { $sum: "$points" } } },
    ]);

    const oldestEvent = await HousePoint.findOne().sort({ timestamp: 1 });
    const newestEvent = await HousePoint.findOne().sort({ timestamp: -1 });

    res.json({
      success: true,
      stats: {
        totalEvents,
        totalPoints: totalPoints.length > 0 ? totalPoints[0].total : 0,
        oldestEvent: oldestEvent ? oldestEvent.timestamp : null,
        newestEvent: newestEvent ? newestEvent.timestamp : null,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
