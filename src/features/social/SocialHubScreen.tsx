import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Trophy, 
  Medal,
  Crown,
  Sparkle,
  UserCirclePlus,
  MagnifyingGlass
} from '@phosphor-icons/react';
import { useGame } from '@/contexts/GameContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { BackButton } from '@/components/ui/BackButton';
import { 
  getLeaderboard, 
  LeaderboardEntry, 
  LeaderboardCategory,
  getCategoryLabel,
  getCategoryIcon,
  formatScore
} from '@/lib/leaderboard';

const CATEGORIES: LeaderboardCategory[] = ['coins', 'totalSpins', 'biggestWin', 'totalEarnings', 'level', 'prestigePoints'];

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Crown size={20} weight="fill" className="text-yellow-400" />;
  if (rank === 2) return <Medal size={20} weight="fill" className="text-gray-400" />;
  if (rank === 3) return <Medal size={20} weight="fill" className="text-orange-600" />;
  return null;
};

const getRankStyle = (rank: number) => {
  if (rank === 1) return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border-yellow-500/50';
  if (rank === 2) return 'bg-gradient-to-r from-gray-400/20 to-gray-500/10 border-gray-400/50';
  if (rank === 3) return 'bg-gradient-to-r from-orange-500/20 to-orange-600/10 border-orange-500/50';
  return 'bg-card/50 border-border/50';
};

interface LeaderboardItemProps {
  entry: LeaderboardEntry;
  rank: number;
  category: LeaderboardCategory;
  isCurrentUser: boolean;
}

const LeaderboardItem: React.FC<LeaderboardItemProps> = ({ entry, rank, category, isCurrentUser }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: rank * 0.05 }}
  >
    <Card className={`p-3 ${getRankStyle(rank)} ${isCurrentUser ? 'ring-2 ring-accent' : ''}`}>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 flex items-center justify-center">
          {getRankIcon(rank) || (
            <span className="text-sm font-bold text-muted-foreground">#{rank}</span>
          )}
        </div>
        
        <Avatar className="w-10 h-10 border-2 border-border">
          <AvatarFallback className="bg-primary/20 text-primary">
            {entry.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <p className="font-bold text-foreground truncate">
            {entry.username}
            {isCurrentUser && <Badge className="ml-2 text-[10px]">You</Badge>}
          </p>
          <p className="text-xs text-muted-foreground">Level {entry.level}</p>
        </div>
        
        <div className="text-right">
          <p className="font-bold text-primary">{formatScore(category, entry.score)}</p>
        </div>
      </div>
    </Card>
  </motion.div>
);

export const SocialHubScreen: React.FC = () => {
  const { userId } = useGame();
  const [activeTab, setActiveTab] = useState('leaderboard');
  const [selectedCategory, setSelectedCategory] = useState<LeaderboardCategory>('coins');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadLeaderboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const entries = await getLeaderboard(selectedCategory);
      setLeaderboardData(entries);
    } catch (error) {
      console.error('[SocialHub] Error loading leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  return (
    <ScrollArea className="h-[calc(100vh-4rem)] w-full">
      <div className="p-4 pb-24">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
        <BackButton />
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users size={28} weight="fill" className="text-primary" />
            Social Hub
          </h1>
          <p className="text-sm text-muted-foreground">Compete & connect with players</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full mb-4 bg-card/50">
          <TabsTrigger value="leaderboard" className="flex-1 gap-1">
            <Trophy size={16} weight="fill" /> Leaderboard
          </TabsTrigger>
          <TabsTrigger value="friends" className="flex-1 gap-1">
            <Users size={16} weight="fill" /> Friends
          </TabsTrigger>
        </TabsList>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="mt-0 space-y-4">
          {/* Category Selector */}
          <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as LeaderboardCategory)}>
            <SelectTrigger className="w-full h-12 bg-card/50">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(category => (
                <SelectItem key={category} value={category}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getCategoryIcon(category)}</span>
                    <span className="font-medium">{getCategoryLabel(category)}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Leaderboard List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkle size={32} weight="fill" className="text-primary" />
              </motion.div>
            </div>
          ) : leaderboardData.length > 0 ? (
            <div className="space-y-2">
              {leaderboardData.map((entry, index) => (
                <LeaderboardItem
                  key={entry.userId}
                  entry={entry}
                  rank={index + 1}
                  category={selectedCategory}
                  isCurrentUser={entry.userId === userId}
                />
              ))}
            </div>
          ) : (
            <Card className="p-8 bg-card/50 text-center">
              <Trophy size={48} weight="fill" className="text-muted-foreground mx-auto mb-3" />
              <h3 className="font-bold text-foreground mb-1">No Data Yet</h3>
              <p className="text-sm text-muted-foreground">
                Connect to Supabase to see global leaderboards
              </p>
            </Card>
          )}
        </TabsContent>

        {/* Friends Tab */}
        <TabsContent value="friends" className="mt-0">
          <Card className="p-8 bg-card/50 text-center">
            <UserCirclePlus size={48} weight="fill" className="text-muted-foreground mx-auto mb-3" />
            <h3 className="font-bold text-foreground mb-1">Friends Coming Soon</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add friends and compete together!
            </p>
            <Button variant="outline" disabled>
              <MagnifyingGlass size={16} className="mr-2" />
              Find Friends
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </ScrollArea>
  );
};
