import React from 'react';
import { BackButton } from '@/components/ui/BackButton';
import { useGame } from '@/contexts/GameContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

export const SettingsScreen: React.FC = () => {
  const { gameState, setGameState, resetGame } = useGame();
  const { preferences } = gameState;

  const updatePreference = (key: keyof typeof preferences, value: any) => {
    setGameState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        preferences: {
          ...prev.preferences,
          [key]: value
        }
      };
    });
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset your progress? This cannot be undone.')) {
      resetGame();
      toast.success('Game progress reset.');
    }
  };

  return (
    <div className='w-full h-full flex flex-col bg-[#050317]'>
      {/* Header */}
      <div className='flex items-center justify-between p-4 bg-black/40 border-b border-white/10'>
        <BackButton />
        <h1 className='text-xl font-bold text-white tracking-widest uppercase'>Settings</h1>
        <div className='w-16' />
      </div>

      <div className='flex-1 overflow-y-auto p-4 space-y-6 max-w-2xl mx-auto w-full'>
        
        {/* Audio Settings */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Audio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="sound-effects" className="text-white">Sound Effects</Label>
              <Switch 
                id="sound-effects" 
                checked={preferences.soundEnabled}
                onCheckedChange={(checked) => updatePreference('soundEnabled', checked)}
              />
            </div>
            <Separator className="bg-white/10" />
            <div className="flex items-center justify-between">
              <Label htmlFor="music" className="text-white">Music</Label>
              <Switch 
                id="music" 
                checked={preferences.musicEnabled}
                onCheckedChange={(checked) => updatePreference('musicEnabled', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Gameplay Settings */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Gameplay</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="haptics" className="text-white">Haptic Feedback</Label>
              <Switch 
                id="haptics" 
                checked={preferences.hapticsEnabled}
                onCheckedChange={(checked) => updatePreference('hapticsEnabled', checked)}
              />
            </div>
            
            <Separator className="bg-white/10" />
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-white">Auto-Spin Batch Size</Label>
                <span className="text-sm text-white/70">{preferences.autoSpinBatchSize} Spins</span>
              </div>
              <Slider 
                value={[preferences.autoSpinBatchSize]} 
                min={10} 
                max={100} 
                step={10}
                onValueChange={(vals) => updatePreference('autoSpinBatchSize', vals[0])}
                className="py-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Account / Data */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Data Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2">
              <p className="text-sm text-white/60">
                Your game data is currently saved locally on this device.
              </p>
              <Button 
                variant="destructive" 
                onClick={handleReset}
                className="w-full sm:w-auto self-start mt-2"
              >
                Reset Progress
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-white/30 pt-4">
          v1.0.0 • Casino Idle Slots
        </div>
      </div>
    </div>
  );
};
