import { useMatchState } from "@/hooks/useMatchState";
import { Link } from "react-router-dom";

const Scoreboard = () => {
  const { matchState, timerState } = useMatchState();
  const theme = matchState.theme;

  const formatTime = (mins: number, secs: number) => {
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getBackgroundStyle = () => {
    if (theme.backgroundType === "solid") {
      return { background: theme.backgroundColor };
    } else {
      // Fallback for old data without gradientStops
      if (!theme.gradientStops || theme.gradientStops.length === 0) {
        return {
          background: `linear-gradient(${theme.backgroundGradientAngle}deg, ${theme.backgroundGradientStart} 0%, ${theme.backgroundGradientEnd} 100%)`
        };
      }
      
      const stops = theme.gradientStops
        .map(stop => `${stop.color} ${stop.percentage}%`)
        .join(', ');
      return {
        background: `linear-gradient(${theme.backgroundGradientAngle}deg, ${stops})`
      };
    }
  };

  return (
    <div className="scoreboard">
      <div 
        className="scoreboard-inner"
        style={getBackgroundStyle()}
      >
        {/* Stadium Header */}
        <div className="stadium-header">
          <span 
            className="stadium-name"
            style={{ color: theme.secondaryTextColor }}
          >
            {matchState.stadium}
          </span>
        </div>

        {/* Main Timer Section */}
        <div className="timer-section">
          <div className="team-badge home-badge">
            <div 
              className="badge-circle home-circle"
              style={{ 
                background: theme.homeBadgeBackground,
                borderColor: theme.homeTeamColor 
              }}
            >
              <span className="badge-icon">{matchState.homeTeam.logo}</span>
            </div>
          </div>

          <div className="timer-display">
            <span 
              className="match-time"
              style={{ color: theme.timerColor }}
            >
              {formatTime(timerState.minutes, timerState.seconds)}
              {timerState.addedTime > 0 && (
                <span className="added-time">+{timerState.addedTime}</span>
              )}
            </span>
            <span 
              className="match-date"
              style={{ color: theme.secondaryTextColor }}
            >
              {matchState.matchDate}
            </span>
          </div>

          {/* Added Time Notification */}
          {timerState.showAddedTime && timerState.addedTime > 0 && (
            <div className="added-time-notification">
              <span className="added-time-text">+{timerState.addedTime}</span>
              <span className="added-time-label">ADDED TIME</span>
            </div>
          )}

          <div className="team-badge away-badge">
            <div 
              className="badge-circle away-circle"
              style={{ 
                background: theme.awayBadgeBackground,
                borderColor: theme.awayTeamColor 
              }}
            >
              <span className="badge-icon">{matchState.awayTeam.logo}</span>
            </div>
          </div>
        </div>

        {/* Score Section */}
        <div className="score-section">
          {/* Home Team Cards (Left side) */}
          <div className="team-cards home-cards">
            {matchState.homeTeam.cards.slice(-5).map((card, index) => (
              <div 
                key={`card-${index}`} 
                className="card-event"
                style={{ 
                  color: theme.goalCardTextColor 
                }}
              >
                <span className="player-name">{card.player}</span>
                <span className={`card-icon ${card.type}`}>
                  {card.type === "red" ? "🟥" : "🟨"}
                </span>
              </div>
            ))}
          </div>

          {/* Home Team Goals */}
          <div className="team-events home-events">
            {matchState.homeTeam.goals.slice(-5).map((goal, index) => (
              <div 
                key={index} 
                className="goal-event"
                style={{ 
                  color: theme.goalCardTextColor 
                }}
              >
                <span className="player-name">{goal.player}</span>
                <span className="goal-minute">{goal.minute}:{goal.second?.toString().padStart(2, '0') || '00'}'</span>
                <span className="goal-icon">⚽</span>
              </div>
            ))}
          </div>

          {/* Score Display */}
          <div className="score-display">
            <div className="score-with-name">
              <span 
                className="team-short-name"
                style={{ color: theme.homeTeamColor }}
              >
                {matchState.homeTeam.shortName}
              </span>
              <span 
                className="score home-score"
                style={{ color: theme.scoreColor }}
              >
                {matchState.homeTeam.score}
              </span>
            </div>
            <div className="league-badge">
              <div 
                className="league-icon"
                style={{ background: theme.leagueIconBackground }}
              >
                <span>⚽</span>
              </div>
              <span 
                className="league-text"
                style={{ color: theme.secondaryTextColor }}
              >
                {matchState.league.split(" ")[0]}
              </span>
              <span 
                className="league-text"
                style={{ color: theme.secondaryTextColor }}
              >
                {matchState.league.split(" ").slice(1).join(" ")}
              </span>
            </div>
            <div className="score-with-name">
              <span 
                className="team-short-name"
                style={{ color: theme.awayTeamColor }}
              >
                {matchState.awayTeam.shortName}
              </span>
              <span 
                className="score away-score"
                style={{ color: theme.scoreColor }}
              >
                {matchState.awayTeam.score}
              </span>
            </div>
          </div>

          {/* Away Team Goals */}
          <div className="team-events away-events">
            {matchState.awayTeam.goals.slice(-5).map((goal, index) => (
              <div 
                key={index} 
                className="goal-event"
                style={{ 
                  color: theme.goalCardTextColor 
                }}
              >
                <span className="goal-icon">⚽</span>
                <span className="goal-minute">{goal.minute}:{goal.second?.toString().padStart(2, '0') || '00'}'</span>
                <span className="player-name">{goal.player}</span>
              </div>
            ))}
          </div>

          {/* Away Team Cards (Right side) */}
          <div className="team-cards away-cards">
            {matchState.awayTeam.cards.slice(-5).map((card, index) => (
              <div 
                key={`card-${index}`} 
                className="card-event"
                style={{ 
                  color: theme.goalCardTextColor 
                }}
              >
                <span className={`card-icon ${card.type}`}>
                  {card.type === "red" ? "🟥" : "🟨"}
                </span>
                <span className="player-name">{card.player}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Team Names */}
        <div className="teams-section">
          <span 
            className="team-name home-name"
            style={{ color: theme.homeTeamColor }}
          >
            {matchState.homeTeam.name}
          </span>
          <span 
            className="team-name away-name"
            style={{ color: theme.awayTeamColor }}
          >
            {matchState.awayTeam.name}
          </span>
        </div>

        {/* Live Indicator */}
        {timerState.isRunning && (
          <div className="live-indicator">
            <span className="live-dot"></span>
            <span className="live-text">LIVE</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Scoreboard;
