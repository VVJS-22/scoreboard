import { useState, useEffect, useRef } from "react";
import { useMatchState, type GradientStop, presetThemes } from "@/hooks/useMatchState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Pause, RotateCcw, Plus, Minus, Trash2, Palette, Upload, X, Save, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const Admin = () => {
  const {
    matchState,
    timerState,
    updateMatchState,
    updateHomeTeam,
    updateAwayTeam,
    addHomeGoal,
    addAwayGoal,
    startTimer,
    stopTimer,
    resetTimer,
    updateTimer,
    setTimerEndTime,
    setAddedTime,
    resetMatch,
    updateTheme,
    resetTheme,
    savedThemes,
    saveTheme,
    loadTheme,
    deleteTheme,
  } = useMatchState();

  const [themeNameInput, setThemeNameInput] = useState("");
  const [showSaveThemeDialog, setShowSaveThemeDialog] = useState(false);

  const homeFileInputRef = useRef<HTMLInputElement>(null);
  const awayFileInputRef = useRef<HTMLInputElement>(null);

  // Handle image upload and convert to data URL
  const handleImageUpload = (file: File, team: 'home' | 'away') => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Check file size (limit to 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const updateTeam = team === 'home' ? updateHomeTeam : updateAwayTeam;
      const currentCustomLogos = matchState.customLogos || [];
      
      // Add new logo to shared array and keep last 10
      const updatedLogos = [dataUrl, ...currentCustomLogos].slice(0, 10);
      updateMatchState({ customLogos: updatedLogos });
      updateTeam({ logo: dataUrl });
      
      toast.success('Logo uploaded successfully!');
    };
    reader.onerror = () => {
      toast.error('Failed to upload image');
    };
    reader.readAsDataURL(file);
  };

  // Remove custom logo
  const removeCustomLogo = (index: number) => {
    const currentCustomLogos = matchState.customLogos || [];
    const updatedLogos = currentCustomLogos.filter((_, i) => i !== index);
    updateMatchState({ customLogos: updatedLogos });
  };

  const [homeGoalCount, setHomeGoalCount] = useState("");
  const [awayGoalCount, setAwayGoalCount] = useState("");
  const [startMinuteInput, setStartMinuteInput] = useState("");
  const [initialStartMinute, setInitialStartMinute] = useState<number>(0);
  const [endTimeInput, setEndTimeInput] = useState(timerState.endMinutes?.toString() || "");

  const formatTime = (mins: number, secs: number) => {
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const setTimerStartTime = (minutes: number) => {
    updateTimer({ minutes, seconds: 0, isRunning: false });
  };

  const handleAddHomeGoal = () => {
    const count = homeGoalCount.trim() === "" ? 1 : parseInt(homeGoalCount);
    if (!isNaN(count) && count > 0) {
      const currentScore = matchState.homeTeam.score;
      const newScore = currentScore + count;
      const newGoals = [];
      for (let i = 0; i < newScore; i++) {
        newGoals.push(`Goal ${i + 1}`);
      }
      updateHomeTeam({ goals: newGoals, score: newScore });
    }
  };

  const handleRemoveHomeGoalBulk = () => {
    const count = homeGoalCount.trim() === "" ? 1 : parseInt(homeGoalCount);
    if (!isNaN(count) && count > 0 && matchState.homeTeam.score > 0) {
      const currentScore = matchState.homeTeam.score;
      const newScore = Math.max(0, currentScore - count);
      const newGoals = [];
      for (let i = 0; i < newScore; i++) {
        newGoals.push(`Goal ${i + 1}`);
      }
      updateHomeTeam({ goals: newGoals, score: newScore });
    }
  };

  const handleAddAwayGoal = () => {
    const count = awayGoalCount.trim() === "" ? 1 : parseInt(awayGoalCount);
    if (!isNaN(count) && count > 0) {
      const currentScore = matchState.awayTeam.score;
      const newScore = currentScore + count;
      const newGoals = [];
      for (let i = 0; i < newScore; i++) {
        newGoals.push(`Goal ${i + 1}`);
      }
      updateAwayTeam({ goals: newGoals, score: newScore });
    }
  };

  const handleRemoveAwayGoalBulk = () => {
    const count = awayGoalCount.trim() === "" ? 1 : parseInt(awayGoalCount);
    if (!isNaN(count) && count > 0 && matchState.awayTeam.score > 0) {
      const currentScore = matchState.awayTeam.score;
      const newScore = Math.max(0, currentScore - count);
      const newGoals = [];
      for (let i = 0; i < newScore; i++) {
        newGoals.push(`Goal ${i + 1}`);
      }
      updateAwayTeam({ goals: newGoals, score: newScore });
    }
  };

  // Unified remove handlers
  const handleRemoveGoal = (team: 'home' | 'away', index: number) => {
    const updateTeam = team === 'home' ? updateHomeTeam : updateAwayTeam;
    const goals = team === 'home' ? matchState.homeTeam.goals : matchState.awayTeam.goals;
    const newGoals = goals.filter((_, i) => i !== index);
    updateTeam({ goals: newGoals, score: newGoals.length });
  };

  const handleRemoveHomeGoal = (index: number) => handleRemoveGoal('home', index);
  const handleRemoveAwayGoal = (index: number) => handleRemoveGoal('away', index);

  // Theme save handlers
  const handleSaveTheme = () => {
    if (!themeNameInput.trim()) {
      toast.error('Please enter a theme name');
      return;
    }
    
    saveTheme(themeNameInput.trim());
    setThemeNameInput("");
    setShowSaveThemeDialog(false);
    toast.success(`Theme "${themeNameInput.trim()}" saved successfully!`);
  };

  const handleLoadTheme = (themeId: string, themeName: string) => {
    loadTheme(themeId);
    toast.success(`Theme "${themeName}" applied!`);
  };

  const handleDeleteTheme = (themeId: string, themeName: string) => {
    deleteTheme(themeId);
    toast.success(`Theme "${themeName}" deleted!`);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground font-['Oswald']">
            Match Control Panel
          </h1>
          <Link to="/">
            <Button variant="outline">View Scoreboard</Button>
          </Link>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="match" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="match">Match Control</TabsTrigger>
            <TabsTrigger value="theme">
              <Palette className="w-4 h-4 mr-2" />
              Theme Settings
            </TabsTrigger>
          </TabsList>

          {/* Match Control Tab */}
          <TabsContent value="match" className="space-y-6">
        {/* Timer Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Match Timer</span>
              <span className="text-4xl font-['Oswald'] text-primary">
                {formatTime(timerState.minutes, timerState.seconds)}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Timer Start and End Time Settings */}
            <div className="space-y-3 mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Start Timer At (minutes)</label>
                  <Input
                    type="number"
                    value={startMinuteInput}
                    onChange={(e) => setStartMinuteInput(e.target.value)}
                    placeholder="e.g., 0 or 45"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Auto-stop Timer At (minutes)</label>
                  <Input
                    type="number"
                    value={endTimeInput}
                    onChange={(e) => setEndTimeInput(e.target.value)}
                    placeholder="e.g., 45 or 90"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    const startMinutes = startMinuteInput.trim() === "" ? 0 : parseInt(startMinuteInput);
                    const endMinutes = endTimeInput.trim() === "" ? null : parseInt(endTimeInput);
                    
                    if (!isNaN(startMinutes) && startMinutes >= 0) {
                      setTimerStartTime(startMinutes);
                      setInitialStartMinute(startMinutes);
                    }
                    if (endMinutes !== null && !isNaN(endMinutes) && endMinutes > 0) {
                      setTimerEndTime(endMinutes);
                    }
                  }}
                  variant="outline"
                >
                  Set
                </Button>
                <Button 
                  onClick={() => {
                    setTimerEndTime(null);
                    setStartMinuteInput("");
                    setEndTimeInput("");
                    setInitialStartMinute(0);
                  }}
                  variant="ghost"
                >
                  Clear
                </Button>
              </div>
              {timerState.endMinutes !== null && (
                <p className="text-xs text-muted-foreground">
                  Timer starts at {initialStartMinute} and will stop at {timerState.endMinutes} minutes
                </p>
              )}
            </div>

            <Separator className="my-4" />

            <div className="flex flex-wrap gap-3 mb-4">
              {timerState.isRunning ? (
                <Button onClick={stopTimer} variant="destructive" size="lg">
                  <Pause className="mr-2 h-5 w-5" />
                  Stop
                </Button>
              ) : (
                <Button onClick={startTimer} size="lg" className="bg-green-600 hover:bg-green-700">
                  <Play className="mr-2 h-5 w-5" />
                  Start
                </Button>
              )}
              <Button onClick={resetTimer} variant="outline" size="lg">
                <RotateCcw className="mr-2 h-5 w-5" />
                Reset Timer
              </Button>
              <Button onClick={resetMatch} variant="destructive" size="lg">
                <Trash2 className="mr-2 h-5 w-5" />
                Reset Entire Match
              </Button>
            </div>
            
            {/* Added Time Controls */}
            {timerState.endMinutes !== null && (
              <>
                <Separator className="my-4" />
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Added Time</label>
                  <div className="flex gap-2 flex-wrap">
                <Button 
                  onClick={() => setAddedTime(1)}
                  variant="outline"
                  size="sm"
                >
                  +1 min
                </Button>
                <Button 
                  onClick={() => setAddedTime(2)}
                  variant="outline"
                  size="sm"
                >
                  +2 min
                </Button>
                <Button 
                  onClick={() => setAddedTime(3)}
                  variant="outline"
                  size="sm"
                >
                  +3 min
                </Button>
                <Button 
                  onClick={() => setAddedTime(4)}
                  variant="outline"
                  size="sm"
                >
                  +4 min
                </Button>
                <Button 
                  onClick={() => setAddedTime(5)}
                  variant="outline"
                  size="sm"
                >
                  +5 min
                </Button>
                <Button 
                  onClick={() => setAddedTime(0)}
                  variant="ghost"
                  size="sm"
                >
                  Clear
                </Button>
              </div>
              {timerState.addedTime > 0 && (
                <p className="text-xs text-muted-foreground">
                  Added time: +{timerState.addedTime} minutes
                </p>
              )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Teams Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Home Team */}
          <Card className="border-l-4" style={{ borderLeftColor: "hsl(var(--team-home))" }}>
            <CardHeader>
              <CardTitle className="text-xl" style={{ color: "hsl(var(--team-home))" }}>
                {matchState.homeTeam.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Team Name Edit */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Team Name</label>
                <Input
                  value={matchState.homeTeam.name}
                  onChange={(e) => updateHomeTeam({ name: e.target.value })}
                  placeholder="Team Name"
                />
              </div>

              {/* Short Name Edit */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Short Name</label>
                <Input
                  value={matchState.homeTeam.shortName}
                  onChange={(e) => updateHomeTeam({ shortName: e.target.value })}
                  placeholder="Short Name (e.g., MCI)"
                />
              </div>

              {/* Logo Edit */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Logo</label>
                <div className="flex gap-2 items-center">
                  <div className="w-20 h-20 flex items-center justify-center text-5xl overflow-hidden">
                    {matchState.homeTeam.logo?.startsWith('data:image') ? (
                      <img src={matchState.homeTeam.logo} alt="Home team logo" className="w-full h-full object-contain" />
                    ) : (
                      matchState.homeTeam.logo || "⚽"
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <Button
                      variant="outline"
                      onClick={() => homeFileInputRef.current?.click()}
                      className="w-full h-12 text-lg"
                    >
                      <Upload className="mr-2 h-5 w-5" />
                      Upload Logo
                    </Button>
                    <input
                      ref={homeFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUpload(file, 'home');
                        }
                        e.target.value = ''; // Reset input
                      }}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Score Display */}
              <div className="text-center">
                <span className="text-6xl font-bold font-['Oswald']">
                  {matchState.homeTeam.score}
                </span>
                <p className="text-sm text-muted-foreground mt-1">Goals</p>
              </div>

              {/* Add Goal */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Add/Remove Goals</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="1"
                    value={homeGoalCount}
                    onChange={(e) => setHomeGoalCount(e.target.value)}
                    placeholder="Number of goals (leave empty for 1)"
                    onKeyDown={(e) => e.key === "Enter" && handleAddHomeGoal()}
                  />
                  <Button onClick={handleAddHomeGoal} size="icon" title="Add goals">
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button onClick={handleRemoveHomeGoalBulk} size="icon" variant="destructive" title="Remove goals">
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              </div>


            </CardContent>
          </Card>

          {/* Away Team */}
          <Card className="border-l-4" style={{ borderLeftColor: "hsl(var(--team-away))" }}>
            <CardHeader>
              <CardTitle className="text-xl" style={{ color: "hsl(var(--team-away))" }}>
                {matchState.awayTeam.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Team Name Edit */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Team Name</label>
                <Input
                  value={matchState.awayTeam.name}
                  onChange={(e) => updateAwayTeam({ name: e.target.value })}
                  placeholder="Team Name"
                />
              </div>

              {/* Short Name Edit */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Short Name</label>
                <Input
                  value={matchState.awayTeam.shortName}
                  onChange={(e) => updateAwayTeam({ shortName: e.target.value })}
                  placeholder="Short Name (e.g., AVL)"
                />
              </div>

              {/* Logo Edit */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Logo</label>
                <div className="flex gap-2 items-center">
                  <div className="w-20 h-20 flex items-center justify-center text-5xl overflow-hidden">
                    {matchState.awayTeam.logo?.startsWith('data:image') ? (
                      <img src={matchState.awayTeam.logo} alt="Away team logo" className="w-full h-full object-contain" />
                    ) : (
                      matchState.awayTeam.logo || "🦁"
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <Button
                      variant="outline"
                      onClick={() => awayFileInputRef.current?.click()}
                      className="w-full h-12 text-lg"
                    >
                      <Upload className="mr-2 h-5 w-5" />
                      Upload Logo
                    </Button>
                    <input
                      ref={awayFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUpload(file, 'away');
                        }
                        e.target.value = ''; // Reset input
                      }}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Score Display */}
              <div className="text-center">
                <span className="text-6xl font-bold font-['Oswald']">
                  {matchState.awayTeam.score}
                </span>
                <p className="text-sm text-muted-foreground mt-1">Goals</p>
              </div>

              {/* Add Goal */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Add/Remove Goals</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="1"
                    value={awayGoalCount}
                    onChange={(e) => setAwayGoalCount(e.target.value)}
                    placeholder="Number of goals (leave empty for 1)"
                    onKeyDown={(e) => e.key === "Enter" && handleAddAwayGoal()}
                  />
                  <Button onClick={handleAddAwayGoal} size="icon" title="Add goals">
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button onClick={handleRemoveAwayGoalBulk} size="icon" variant="destructive" title="Remove goals">
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              </div>


            </CardContent>
          </Card>
        </div>

        {/* Match Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Match Settings</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Stadium</label>
              <Input
                value={matchState.stadium}
                onChange={(e) => updateMatchState({ stadium: e.target.value })}
                placeholder="Stadium Name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">League</label>
              <Input
                value={matchState.league}
                onChange={(e) => updateMatchState({ league: e.target.value })}
                placeholder="League Name"
              />
            </div>
          </CardContent>
        </Card>
          </TabsContent>

          {/* Theme Settings Tab */}
          <TabsContent value="theme" className="space-y-6">
            {/* Saved Themes Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Saved Themes</span>
                  <Button 
                    onClick={() => setShowSaveThemeDialog(!showSaveThemeDialog)} 
                    variant="outline" 
                    size="sm"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Current Theme
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Save Theme Dialog */}
                {showSaveThemeDialog && (
                  <div className="p-4 border rounded-lg bg-secondary/20 space-y-3">
                    <label className="text-sm font-medium">Theme Name</label>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="e.g., My Custom Theme"
                        value={themeNameInput}
                        onChange={(e) => setThemeNameInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveTheme();
                          if (e.key === 'Escape') setShowSaveThemeDialog(false);
                        }}
                        autoFocus
                      />
                      <Button onClick={handleSaveTheme} size="sm">
                        Save
                      </Button>
                      <Button onClick={() => {
                        setShowSaveThemeDialog(false);
                        setThemeNameInput("");
                      }} variant="outline" size="sm">
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* Preset Themes */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">Preset Themes</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {presetThemes.map((theme) => (
                      <div 
                        key={theme.id}
                        className="border rounded-lg p-3 hover:border-primary transition-colors cursor-pointer"
                        onClick={() => handleLoadTheme(theme.id, theme.name)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{theme.name}</span>
                        </div>
                        <div 
                          className="h-12 rounded border"
                          style={{
                            background: theme.theme.backgroundType === 'solid' 
                              ? theme.theme.backgroundColor
                              : `linear-gradient(${theme.theme.backgroundGradientAngle}deg, ${
                                  (theme.theme.gradientStops || [
                                    { color: theme.theme.backgroundGradientStart, percentage: 0 },
                                    { color: theme.theme.backgroundGradientEnd, percentage: 100 }
                                  ]).map(stop => `${stop.color} ${stop.percentage}%`).join(', ')
                                })`
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* User Saved Themes */}
                {savedThemes.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold">Your Saved Themes</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {savedThemes.map((theme) => (
                        <div 
                          key={theme.id}
                          className="border rounded-lg p-3 hover:border-primary transition-colors cursor-pointer"
                          onClick={() => handleLoadTheme(theme.id, theme.name)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{theme.name}</span>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTheme(theme.id, theme.name);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div 
                            className="h-12 rounded border"
                            style={{
                              background: theme.theme.backgroundType === 'solid' 
                                ? theme.theme.backgroundColor
                                : `linear-gradient(${theme.theme.backgroundGradientAngle}deg, ${
                                    (theme.theme.gradientStops || [
                                      { color: theme.theme.backgroundGradientStart, percentage: 0 },
                                      { color: theme.theme.backgroundGradientEnd, percentage: 100 }
                                    ]).map(stop => `${stop.color} ${stop.percentage}%`).join(', ')
                                  })`
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Color Customization</span>
                  <Button onClick={resetTheme} variant="outline" size="sm">
                    Reset to Default
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Background Colors */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Background & Layout</h3>
                  
                  {/* Background Type Selector */}
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Background Type</label>
                    <div className="flex gap-2">
                      <Button
                        variant={matchState.theme.backgroundType === "solid" ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateTheme({ backgroundType: "solid" })}
                      >
                        Solid Color
                      </Button>
                      <Button
                        variant={matchState.theme.backgroundType === "linear" ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateTheme({ backgroundType: "linear" })}
                      >
                        Gradient
                      </Button>
                    </div>
                  </div>

                  {matchState.theme.backgroundType === "solid" ? (
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Background Color</label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={matchState.theme.backgroundColor}
                          onChange={(e) => updateTheme({ backgroundColor: e.target.value })}
                          className="w-20 h-10"
                        />
                        <Input
                          type="text"
                          value={matchState.theme.backgroundColor}
                          onChange={(e) => updateTheme({ backgroundColor: e.target.value })}
                          placeholder="#1a1a2e"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 border rounded-lg p-3 bg-secondary/20">
                      {/* Gradient Preview with Direction Indicator */}
                      <div 
                        className="relative h-16 rounded-lg border-2 border-border overflow-hidden"
                        style={{
                          background: `linear-gradient(${matchState.theme.backgroundGradientAngle}deg, ${
                            (matchState.theme.gradientStops || [
                              { color: matchState.theme.backgroundGradientStart, percentage: 0 },
                              { color: matchState.theme.backgroundGradientEnd, percentage: 100 }
                            ]).map(stop => `${stop.color} ${stop.percentage}%`).join(', ')
                          })`
                        }}
                      >
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div 
                            className="absolute w-16 h-0.5 bg-white/80 transition-transform duration-200 shadow-lg"
                            style={{
                              transform: `rotate(${matchState.theme.backgroundGradientAngle}deg)`,
                              boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)'
                            }}
                          >
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-lg" />
                          </div>
                          <div className="w-2 h-2 rounded-full bg-white/50" />
                        </div>
                        <div className="absolute top-2 right-2 text-xs font-mono bg-black/50 text-white px-2 py-0.5 rounded backdrop-blur-sm">
                          {matchState.theme.backgroundGradientAngle}°
                        </div>
                      </div>
                      
                      {/* Compact Direction Control */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-medium text-muted-foreground">Direction</label>
                          <input
                            type="range"
                            min="0"
                            max="360"
                            step="1"
                            value={matchState.theme.backgroundGradientAngle}
                            onChange={(e) => updateTheme({ backgroundGradientAngle: parseInt(e.target.value) })}
                            className="flex-1 h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer 
                              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
                              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary 
                              [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:hover:scale-110 
                              [&::-webkit-slider-thumb]:transition-transform
                              [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full 
                              [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                          />
                        </div>
                        <div className="flex gap-1">
                          {[
                            { angle: 0, icon: "→" },
                            { angle: 45, icon: "↗" },
                            { angle: 90, icon: "↓" },
                            { angle: 135, icon: "↘" },
                            { angle: 180, icon: "↑" },
                            { angle: 225, icon: "↖" },
                            { angle: 270, icon: "←" },
                            { angle: 315, icon: "↙" }
                          ].map(({ angle, icon }) => (
                            <Button
                              key={angle}
                              variant={matchState.theme.backgroundGradientAngle === angle ? "default" : "outline"}
                              size="sm"
                              onClick={() => updateTheme({ backgroundGradientAngle: angle })}
                              className="flex-1 h-7 text-xs px-1"
                            >
                              {icon}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <Separator className="my-2" />

                      {/* Compact Color Stops */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-medium text-muted-foreground">Color Stops</label>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={() => {
                              const currentStops = matchState.theme.gradientStops || [
                                { color: matchState.theme.backgroundGradientStart, percentage: 0 },
                                { color: matchState.theme.backgroundGradientEnd, percentage: 100 }
                              ];
                              const newStops = [...currentStops, { color: "#ffffff", percentage: 50 }];
                              updateTheme({ gradientStops: newStops.sort((a, b) => a.percentage - b.percentage) });
                            }}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {(matchState.theme.gradientStops || [
                            { color: matchState.theme.backgroundGradientStart, percentage: 0 },
                            { color: matchState.theme.backgroundGradientEnd, percentage: 100 }
                          ]).map((stop, index) => (
                            <div key={index} className="flex gap-2 items-center p-2 rounded border">
                              <Input
                                type="color"
                                value={stop.color}
                                onChange={(e) => {
                                  const currentStops = matchState.theme.gradientStops || [
                                    { color: matchState.theme.backgroundGradientStart, percentage: 0 },
                                    { color: matchState.theme.backgroundGradientEnd, percentage: 100 }
                                  ];
                                  const newStops = [...currentStops];
                                  newStops[index] = { ...newStops[index], color: e.target.value };
                                  updateTheme({ gradientStops: newStops });
                                }}
                                className="w-16 h-10 cursor-pointer"
                              />
                              <div className="flex items-center gap-1">
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={stop.percentage}
                                  onChange={(e) => {
                                    const currentStops = matchState.theme.gradientStops || [
                                      { color: matchState.theme.backgroundGradientStart, percentage: 0 },
                                      { color: matchState.theme.backgroundGradientEnd, percentage: 100 }
                                    ];
                                    const newStops = [...currentStops];
                                    newStops[index] = { ...newStops[index], percentage: parseInt(e.target.value) || 0 };
                                    updateTheme({ gradientStops: newStops.sort((a, b) => a.percentage - b.percentage) });
                                  }}
                                  className="w-14 text-center text-sm h-10"
                                />
                                <span className="text-xs text-muted-foreground">%</span>
                              </div>
                              {((matchState.theme.gradientStops || [
                                { color: matchState.theme.backgroundGradientStart, percentage: 0 },
                                { color: matchState.theme.backgroundGradientEnd, percentage: 100 }
                              ]).length > 2) && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 shrink-0"
                                  onClick={() => {
                                    const currentStops = matchState.theme.gradientStops || [
                                      { color: matchState.theme.backgroundGradientStart, percentage: 0 },
                                      { color: matchState.theme.backgroundGradientEnd, percentage: 100 }
                                    ];
                                    const newStops = currentStops.filter((_, i) => i !== index);
                                    updateTheme({ gradientStops: newStops });
                                  }}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Color Controls */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">Colors</h3>
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground">Muted Text</label>
                      <Input
                        type="color"
                        value={matchState.theme.secondaryTextColor}
                        onChange={(e) => updateTheme({ secondaryTextColor: e.target.value })}
                        className="w-20 h-10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground">Goals & Cards</label>
                      <Input
                        type="color"
                        value={matchState.theme.goalCardTextColor}
                        onChange={(e) => updateTheme({ goalCardTextColor: e.target.value })}
                        className="w-20 h-10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground">Timer</label>
                      <Input
                        type="color"
                        value={matchState.theme.timerColor}
                        onChange={(e) => updateTheme({ timerColor: e.target.value })}
                        className="w-20 h-10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground">Score</label>
                      <Input
                        type="color"
                        value={matchState.theme.scoreColor}
                        onChange={(e) => updateTheme({ scoreColor: e.target.value })}
                        className="w-20 h-10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground">League Icon</label>
                      <Input
                        type="color"
                        value={matchState.theme.leagueIconBackground}
                        onChange={(e) => updateTheme({ leagueIconBackground: e.target.value })}
                        className="w-20 h-10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground">Home Team</label>
                      <Input
                        type="color"
                        value={matchState.theme.homeTeamColor}
                        onChange={(e) => updateTheme({ homeTeamColor: e.target.value })}
                        className="w-20 h-10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground">Away Team</label>
                      <Input
                        type="color"
                        value={matchState.theme.awayTeamColor}
                        onChange={(e) => updateTheme({ awayTeamColor: e.target.value })}
                        className="w-20 h-10"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
