import { useMatchState } from "@/hooks/useMatchState";
import { Link } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import { Maximize } from "lucide-react";

const Scoreboard = () => {
  const { matchState, timerState } = useMatchState();
  const theme = matchState.theme;
  const scoreboardRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Track fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const formatTime = (mins: number, secs: number) => {
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleFullscreen = () => {
    if (!scoreboardRef.current) return;

    if (!document.fullscreenElement) {
      scoreboardRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const enterFullscreen = () => {
    if (!scoreboardRef.current || document.fullscreenElement) return;
    
    scoreboardRef.current.requestFullscreen().catch((err) => {
      console.error(`Error attempting to enable fullscreen: ${err.message}`);
    });
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
    <div className="scoreboard" ref={scoreboardRef} onDoubleClick={toggleFullscreen}>
      {/* Fullscreen Button - Only visible when not in fullscreen */}
      {!isFullscreen && (
        <button
          onClick={enterFullscreen}
          className="fixed top-4 right-4 z-50 bg-black/30 hover:bg-black/50 text-white/70 hover:text-white p-3 rounded-lg backdrop-blur-sm transition-all duration-300 opacity-50 hover:opacity-100"
          title="Enter Fullscreen"
        >
          <Maximize className="w-5 h-5" />
        </button>
      )}
      
      <div 
        className="scoreboard-inner"
        style={getBackgroundStyle()}
      >
        {/* Stadium Header */}
        <div className="stadium-header">
          <span 
            className="stadium-name"
            style={{ 
              color: theme.secondaryTextColor,
              fontSize: '3em',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%',
              display: 'inline-block',
              lineHeight: '1.2'
            }}
          >
            {matchState.stadium}
          </span>
        </div>

        {/* Main Timer Section */}
        <div className="timer-section">
          <div className="team-badge home-badge">
            {matchState.homeTeam.logo?.startsWith('data:image') ? (
              <img 
                src={matchState.homeTeam.logo} 
                alt="Home team logo" 
                className="badge-icon-img logo-size"
                style={{ objectFit: 'contain' }}
              />
            ) : (
              <span className="badge-icon">{matchState.homeTeam.logo}</span>
            )}
          </div>

          <div className="timer-display">
            <span 
              className="match-time"
              style={{ color: theme.timerColor }}
            >
              {formatTime(timerState.minutes, timerState.seconds)}
              {timerState.addedTime > 0 && 
               timerState.endMinutes !== null && 
               (timerState.isRunning || timerState.minutes < timerState.endMinutes + timerState.addedTime) && (
                <span className="added-time">{timerState.endMinutes}+{timerState.addedTime}</span>
              )}
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
            {matchState.awayTeam.logo?.startsWith('data:image') ? (
              <img 
                src={matchState.awayTeam.logo} 
                alt="Away team logo" 
                className="badge-icon-img logo-size"
                style={{ objectFit: 'contain' }}
              />
            ) : (
              <span className="badge-icon">{matchState.awayTeam.logo}</span>
            )}
          </div>
        </div>

        {/* Score Section */}
        <div className="score-section">

          {/* Score Display */}
          <div className="score-display">
            <div className="score-with-name">
              <span 
                className="team-short-name"
                style={{ 
                  color: theme.homeTeamColor,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%'
                }}
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
                style={{ 
                  color: theme.secondaryTextColor,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {matchState.league.split(" ")[0]}
              </span>
              <span 
                className="league-text"
                style={{ 
                  color: theme.secondaryTextColor,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {matchState.league.split(" ").slice(1).join(" ")}
              </span>
            </div>
            <div className="score-with-name">
              <span 
                className="team-short-name"
                style={{ 
                  color: theme.awayTeamColor,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%'
                }}
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
        </div>

        {/* Team Names */}
        <div className="teams-section">
          <span 
            className="team-name home-name"
            style={{ 
              color: theme.homeTeamColor,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '45%'
            }}
          >
            {matchState.homeTeam.name}
          </span>
          <span 
            className="team-name away-name"
            style={{ 
              color: theme.awayTeamColor,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '45%'
            }}
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
