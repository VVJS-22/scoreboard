import { useState, useEffect, useRef } from "react";
import { useMatchState, type GradientStop, presetThemes } from "@/hooks/useMatchState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Pause, RotateCcw, Plus, Trash2, Palette, Smile, Upload, X, Save, Download } from "lucide-react";
import { Link } from "react-router-dom";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
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
    addHomeCard,
    addAwayCard,
    startTimer,
    stopTimer,
    resetTimer,
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

  const [showHomeEmojiPicker, setShowHomeEmojiPicker] = useState(false);
  const [showAwayEmojiPicker, setShowAwayEmojiPicker] = useState(false);
  const [themeNameInput, setThemeNameInput] = useState("");
  const [showSaveThemeDialog, setShowSaveThemeDialog] = useState(false);

  const homeEmojiPickerRef = useRef<HTMLDivElement>(null);
  const awayEmojiPickerRef = useRef<HTMLDivElement>(null);
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

  // Close emoji pickers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (homeEmojiPickerRef.current && !homeEmojiPickerRef.current.contains(event.target as Node)) {
        setShowHomeEmojiPicker(false);
      }
      if (awayEmojiPickerRef.current && !awayEmojiPickerRef.current.contains(event.target as Node)) {
        setShowAwayEmojiPicker(false);
      }
    };

    if (showHomeEmojiPicker || showAwayEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showHomeEmojiPicker, showAwayEmojiPicker]);

  const [homeGoalPlayer, setHomeGoalPlayer] = useState("");
  const [awayGoalPlayer, setAwayGoalPlayer] = useState("");
  const [homeCardPlayer, setHomeCardPlayer] = useState("");
  const [awayCardPlayer, setAwayCardPlayer] = useState("");
  const [endTimeInput, setEndTimeInput] = useState(timerState.endMinutes?.toString() || "");

  const formatTime = (mins: number, secs: number) => {
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAddHomeGoal = () => {
    if (homeGoalPlayer.trim()) {
      addHomeGoal(homeGoalPlayer.trim());
      setHomeGoalPlayer("");
    }
  };

  const handleAddAwayGoal = () => {
    if (awayGoalPlayer.trim()) {
      addAwayGoal(awayGoalPlayer.trim());
      setAwayGoalPlayer("");
    }
  };

  // Unified card handler
  const handleAddCard = (team: 'home' | 'away', cardType: 'yellow' | 'red') => {
    const player = team === 'home' ? homeCardPlayer : awayCardPlayer;
    const setPlayer = team === 'home' ? setHomeCardPlayer : setAwayCardPlayer;
    const addCard = team === 'home' ? addHomeCard : addAwayCard;
    
    if (player.trim()) {
      addCard(player.trim(), cardType);
      setPlayer("");
    }
  };

  const handleAddHomeYellowCard = () => handleAddCard('home', 'yellow');
  const handleAddHomeRedCard = () => handleAddCard('home', 'red');
  const handleAddAwayYellowCard = () => handleAddCard('away', 'yellow');
  const handleAddAwayRedCard = () => handleAddCard('away', 'red');

  // Unified remove handlers
  const handleRemoveGoal = (team: 'home' | 'away', index: number) => {
    const updateTeam = team === 'home' ? updateHomeTeam : updateAwayTeam;
    const goals = team === 'home' ? matchState.homeTeam.goals : matchState.awayTeam.goals;
    const newGoals = goals.filter((_, i) => i !== index);
    updateTeam({ goals: newGoals, score: newGoals.length });
  };

  const handleRemoveCard = (team: 'home' | 'away', index: number) => {
    const updateTeam = team === 'home' ? updateHomeTeam : updateAwayTeam;
    const cards = team === 'home' ? matchState.homeTeam.cards : matchState.awayTeam.cards;
    const newCards = cards.filter((_, i) => i !== index);
    updateTeam({ cards: newCards });
  };

  const handleRemoveHomeGoal = (index: number) => handleRemoveGoal('home', index);
  const handleRemoveAwayGoal = (index: number) => handleRemoveGoal('away', index);
  const handleRemoveHomeCard = (index: number) => handleRemoveCard('home', index);
  const handleRemoveAwayCard = (index: number) => handleRemoveCard('away', index);

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
            {/* Timer End Time Setting */}
            <div className="space-y-2 mb-4">
              <label className="text-sm text-muted-foreground">Auto-stop Timer At (minutes)</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={endTimeInput}
                  onChange={(e) => setEndTimeInput(e.target.value)}
                  placeholder="e.g., 90 for 90 minutes"
                  className="max-w-xs"
                />
                <Button 
                  onClick={() => {
                    const minutes = parseInt(endTimeInput);
                    if (!isNaN(minutes) && minutes > 0) {
                      setTimerEndTime(minutes);
                    }
                  }}
                  variant="outline"
                >
                  Set
                </Button>
                <Button 
                  onClick={() => {
                    setTimerEndTime(null);
                    setEndTimeInput("");
                  }}
                  variant="ghost"
                >
                  Clear
                </Button>
              </div>
              {timerState.endMinutes !== null && (
                <p className="text-xs text-muted-foreground">
                  Timer will stop at {timerState.endMinutes} minutes
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
                <label className="text-sm text-muted-foreground">Logo (emoji or image)</label>
                <div className="flex gap-2 items-center">
                  <div className="w-20 h-20 flex items-center justify-center text-5xl overflow-hidden">
                    {matchState.homeTeam.logo?.startsWith('data:image') ? (
                      <img src={matchState.homeTeam.logo} alt="Home team logo" className="w-full h-full object-contain" />
                    ) : (
                      matchState.homeTeam.logo || "⚽"
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="relative">
                      <Button
                        variant="outline"
                        onClick={() => setShowHomeEmojiPicker(!showHomeEmojiPicker)}
                        className="w-full h-12 text-lg"
                      >
                        <Smile className="mr-2 h-5 w-5" />
                        Choose Emoji
                      </Button>
                      {showHomeEmojiPicker && (
                        <div ref={homeEmojiPickerRef} className="absolute z-50 top-full mt-2 bg-background border rounded-lg shadow-lg">
                          {/* Custom Logos Section */}
                          {matchState.customLogos && matchState.customLogos.length > 0 && (
                            <div className="p-3 border-b bg-secondary/20">
                              <div className="text-xs text-muted-foreground mb-2 font-semibold">YOUR UPLOADED LOGOS</div>
                              <div className="grid grid-cols-6 gap-2">
                                {matchState.customLogos.map((logoUrl, idx) => (
                                  <div key={idx} className="relative group">
                                    <button
                                      onClick={() => {
                                        updateHomeTeam({ logo: logoUrl });
                                        setShowHomeEmojiPicker(false);
                                      }}
                                      className="w-12 h-12 border rounded-lg overflow-hidden bg-background hover:border-primary transition-colors"
                                    >
                                      <img src={logoUrl} alt={`Custom logo ${idx + 1}`} className="w-full h-full object-contain" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeCustomLogo(idx);
                                      }}
                                      className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          <EmojiPicker
                            onEmojiClick={(emojiData: EmojiClickData) => {
                              updateHomeTeam({ logo: emojiData.emoji });
                              setShowHomeEmojiPicker(false);
                            }}
                            searchPlaceHolder="Search emoji..."
                            width={350}
                            height={400}
                            theme={Theme.DARK}
                          />
                        </div>
                      )}
                    </div>
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
                <label className="text-sm text-muted-foreground">Add Goal</label>
                <div className="flex gap-2">
                  <Input
                    value={homeGoalPlayer}
                    onChange={(e) => setHomeGoalPlayer(e.target.value)}
                    placeholder="Scorer name"
                    onKeyDown={(e) => e.key === "Enter" && handleAddHomeGoal()}
                  />
                  <Button onClick={handleAddHomeGoal} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Goals List */}
              {matchState.homeTeam.goals.length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Goals:</p>
                  {matchState.homeTeam.goals.map((goal, i) => (
                    <div key={i} className="text-sm flex items-center justify-between gap-2 bg-secondary/50 p-2 rounded">
                      <div className="flex items-center gap-2">
                        <span>⚽</span>
                        <span>{goal.player}</span>
                        <span className="text-muted-foreground">{goal.minute}'</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleRemoveHomeGoal(i)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <Separator />

              {/* Add Cards */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Add Card</label>
                <div className="flex gap-2">
                  <Input
                    value={homeCardPlayer}
                    onChange={(e) => setHomeCardPlayer(e.target.value)}
                    placeholder="Player name"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddHomeYellowCard();
                      }
                    }}
                  />
                  <Button onClick={handleAddHomeYellowCard} className="bg-yellow-500 hover:bg-yellow-600" size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button onClick={handleAddHomeRedCard} variant="destructive" size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Cards List */}
              {matchState.homeTeam.cards.length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Cards:</p>
                  {matchState.homeTeam.cards.map((card, i) => (
                    <div key={i} className="text-sm flex items-center justify-between gap-2 bg-secondary/50 p-2 rounded">
                      <div className="flex items-center gap-2">
                        <span>{card.type === "red" ? "🟥" : "🟨"}</span>
                        <span>{card.player}</span>
                        <span className="text-muted-foreground">{card.minute}'</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleRemoveHomeCard(i)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
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
                <label className="text-sm text-muted-foreground">Logo (emoji or image)</label>
                <div className="flex gap-2 items-center">
                  <div className="w-20 h-20 flex items-center justify-center text-5xl overflow-hidden">
                    {matchState.awayTeam.logo?.startsWith('data:image') ? (
                      <img src={matchState.awayTeam.logo} alt="Away team logo" className="w-full h-full object-contain" />
                    ) : (
                      matchState.awayTeam.logo || "🦁"
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="relative">
                      <Button
                        variant="outline"
                        onClick={() => setShowAwayEmojiPicker(!showAwayEmojiPicker)}
                        className="w-full h-12 text-lg"
                      >
                        <Smile className="mr-2 h-5 w-5" />
                        Choose Emoji
                      </Button>
                      {showAwayEmojiPicker && (
                        <div ref={awayEmojiPickerRef} className="absolute z-50 top-full mt-2 bg-background border rounded-lg shadow-lg">
                          {/* Custom Logos Section */}
                          {matchState.customLogos && matchState.customLogos.length > 0 && (
                            <div className="p-3 border-b bg-secondary/20">
                              <div className="text-xs text-muted-foreground mb-2 font-semibold">YOUR UPLOADED LOGOS</div>
                              <div className="grid grid-cols-6 gap-2">
                                {matchState.customLogos.map((logoUrl, idx) => (
                                  <div key={idx} className="relative group">
                                    <button
                                      onClick={() => {
                                        updateAwayTeam({ logo: logoUrl });
                                        setShowAwayEmojiPicker(false);
                                      }}
                                      className="w-12 h-12 border rounded-lg overflow-hidden bg-background hover:border-primary transition-colors"
                                    >
                                      <img src={logoUrl} alt={`Custom logo ${idx + 1}`} className="w-full h-full object-contain" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeCustomLogo(idx);
                                      }}
                                      className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          <EmojiPicker
                            onEmojiClick={(emojiData: EmojiClickData) => {
                              updateAwayTeam({ logo: emojiData.emoji });
                              setShowAwayEmojiPicker(false);
                            }}
                            searchPlaceHolder="Search emoji..."
                            width={350}
                            height={400}
                            theme={Theme.DARK}
                          />
                        </div>
                      )}
                    </div>
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
                <label className="text-sm text-muted-foreground">Add Goal</label>
                <div className="flex gap-2">
                  <Input
                    value={awayGoalPlayer}
                    onChange={(e) => setAwayGoalPlayer(e.target.value)}
                    placeholder="Scorer name"
                    onKeyDown={(e) => e.key === "Enter" && handleAddAwayGoal()}
                  />
                  <Button onClick={handleAddAwayGoal} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Goals List */}
              {matchState.awayTeam.goals.length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Goals:</p>
                  {matchState.awayTeam.goals.map((goal, i) => (
                    <div key={i} className="text-sm flex items-center justify-between gap-2 bg-secondary/50 p-2 rounded">
                      <div className="flex items-center gap-2">
                        <span>⚽</span>
                        <span>{goal.player}</span>
                        <span className="text-muted-foreground">{goal.minute}'</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleRemoveAwayGoal(i)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <Separator />

              {/* Add Cards */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Add Card</label>
                <div className="flex gap-2">
                  <Input
                    value={awayCardPlayer}
                    onChange={(e) => setAwayCardPlayer(e.target.value)}
                    placeholder="Player name"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddAwayYellowCard();
                      }
                    }}
                  />
                  <Button onClick={handleAddAwayYellowCard} className="bg-yellow-500 hover:bg-yellow-600" size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button onClick={handleAddAwayRedCard} variant="destructive" size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Cards List */}
              {matchState.awayTeam.cards.length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Cards:</p>
                  {matchState.awayTeam.cards.map((card, i) => (
                    <div key={i} className="text-sm flex items-center justify-between gap-2 bg-secondary/50 p-2 rounded">
                      <div className="flex items-center gap-2">
                        <span>{card.type === "red" ? "🟥" : "🟨"}</span>
                        <span>{card.player}</span>
                        <span className="text-muted-foreground">{card.minute}'</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleRemoveAwayCard(i)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
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
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Match Date</label>
              <Input
                value={matchState.matchDate}
                onChange={(e) => updateMatchState({ matchDate: e.target.value })}
                placeholder="DD.MM.YYYY - HH:MM"
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
