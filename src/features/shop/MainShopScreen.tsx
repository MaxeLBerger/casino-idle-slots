import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  Coins, 
  Diamond,
  Gift,
  Star,
  Lightning
} from '@phosphor-icons/react';
import { useGame } from '@/contexts/GameContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BackButton } from '@/components/ui/BackButton';
import { AssetImage } from '@/components/ui/asset-image';
import { formatNumber } from '@/lib/utils';
import { CURRENCY_ICON_ASSETS } from '@/constants/economy.constants';

interface ShopItem {
  id: string;
  name: string;
  description: string;
  amount: number;
  price: number;
  currency: 'diamonds' | 'real';
  bonus?: number;
  popular?: boolean;
  bestValue?: boolean;
}

const COIN_PACKS: ShopItem[] = [
  { id: 'coins_1', name: 'Starter Stack', description: '10,000 Coins', amount: 10000, price: 10, currency: 'diamonds' },
  { id: 'coins_2', name: 'Silver Stash', description: '50,000 Coins', amount: 50000, price: 45, currency: 'diamonds', bonus: 10 },
  { id: 'coins_3', name: 'Gold Vault', description: '150,000 Coins', amount: 150000, price: 120, currency: 'diamonds', bonus: 25, popular: true },
  { id: 'coins_4', name: 'Diamond Treasury', description: '500,000 Coins', amount: 500000, price: 350, currency: 'diamonds', bonus: 40, bestValue: true },
  { id: 'coins_5', name: 'Royal Fortune', description: '1,500,000 Coins', amount: 1500000, price: 900, currency: 'diamonds', bonus: 50 },
];

const DIAMOND_PACKS: ShopItem[] = [
  { id: 'diamonds_1', name: 'Small Pouch', description: '50 Diamonds', amount: 50, price: 0.99, currency: 'real' },
  { id: 'diamonds_2', name: 'Medium Sack', description: '150 Diamonds', amount: 150, price: 2.99, currency: 'real', bonus: 10 },
  { id: 'diamonds_3', name: 'Large Chest', description: '400 Diamonds', amount: 400, price: 6.99, currency: 'real', bonus: 20, popular: true },
  { id: 'diamonds_4', name: 'Treasure Trove', description: '1,000 Diamonds', amount: 1000, price: 14.99, currency: 'real', bonus: 35, bestValue: true },
  { id: 'diamonds_5', name: 'Royal Hoard', description: '2,500 Diamonds', amount: 2500, price: 34.99, currency: 'real', bonus: 50 },
];

const SPECIAL_OFFERS: ShopItem[] = [
  { id: 'special_1', name: 'Starter Bundle', description: '5,000 Coins + 20 Diamonds', amount: 5000, price: 0.99, currency: 'real', popular: true },
  { id: 'special_2', name: 'Weekly Boost', description: '2x Earnings for 24h', amount: 1, price: 50, currency: 'diamonds' },
];

interface ShopItemCardProps {
  item: ShopItem;
  onPurchase: (item: ShopItem) => void;
  canAfford: boolean;
  type: 'coins' | 'diamonds' | 'special';
}

const ShopItemCard: React.FC<ShopItemCardProps> = ({ item, onPurchase, canAfford, type }) => {
  const getIcon = () => {
    if (type === 'coins') return <AssetImage src={CURRENCY_ICON_ASSETS.coins} alt="Coins" className="w-12 h-12 icon-blend" />;
    if (type === 'diamonds') return <AssetImage src={CURRENCY_ICON_ASSETS.diamonds} alt="Diamonds" className="w-12 h-12 icon-blend" />;
    return <Gift size={48} weight="fill" className="text-accent" />;
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className={`relative p-4 bg-card/80 border-border/50 backdrop-blur-sm overflow-hidden ${item.popular ? 'ring-2 ring-accent' : ''} ${item.bestValue ? 'ring-2 ring-primary' : ''}`}>
        {item.popular && (
          <Badge className="absolute -top-1 -right-1 bg-accent text-white text-[10px]">
            <Star size={10} weight="fill" className="mr-0.5" /> Popular
          </Badge>
        )}
        {item.bestValue && (
          <Badge className="absolute -top-1 -right-1 bg-primary text-white text-[10px]">
            <Lightning size={10} weight="fill" className="mr-0.5" /> Best Value
          </Badge>
        )}
        
        <div className="flex items-center gap-3 mb-3">
          {getIcon()}
          <div className="flex-1">
            <h3 className="font-bold text-foreground">{item.name}</h3>
            <p className="text-sm text-muted-foreground">{item.description}</p>
            {item.bonus && (
              <Badge variant="secondary" className="mt-1 text-[10px] bg-green-500/20 text-green-400">
                +{item.bonus}% Bonus
              </Badge>
            )}
          </div>
        </div>
        
        <Button
          onClick={() => onPurchase(item)}
          disabled={!canAfford}
          className="w-full"
          variant={canAfford ? 'default' : 'secondary'}
        >
          {item.currency === 'real' ? (
            <span>${item.price.toFixed(2)}</span>
          ) : (
            <span className="flex items-center gap-1">
              <AssetImage src={CURRENCY_ICON_ASSETS.diamonds} alt="" className="w-4 h-4 icon-blend" />
              {item.price}
            </span>
          )}
        </Button>
      </Card>
    </motion.div>
  );
};

export const MainShopScreen: React.FC = () => {
  const { gameState, setGameState } = useGame();
  // Track purchased items for visual feedback (future: show success animation)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [purchasedItems, setPurchasedItems] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState('coins');

  const handlePurchase = (item: ShopItem) => {
    if (item.currency === 'diamonds') {
      if (gameState.diamonds < item.price) return;
      
      setGameState(prev => {
        if (!prev) return prev;
        const bonusAmount = item.bonus ? Math.floor(item.amount * (item.bonus / 100)) : 0;
        return {
          ...prev,
          diamonds: prev.diamonds - item.price,
          coins: prev.coins + item.amount + bonusAmount,
        };
      });
      
      setPurchasedItems(prev => new Set(prev).add(item.id));
      setTimeout(() => {
        setPurchasedItems(prev => {
          const next = new Set(prev);
          next.delete(item.id);
          return next;
        });
      }, 2000);
    } else {
      // Real money purchases would go through a payment provider
      console.log('[Shop] Real money purchase:', item);
      alert('In-app purchases coming soon! This is a demo.');
    }
  };

  return (
    <ScrollArea className="h-[calc(100vh-4rem)] w-full">
      <div className="p-4 pb-24">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
        <BackButton />
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ShoppingBag size={28} weight="fill" className="text-primary" />
            Shop
          </h1>
          <p className="text-sm text-muted-foreground">Get coins, diamonds & special offers</p>
        </div>
      </div>

      {/* Currency Display */}
      <div className="flex gap-3 mb-6">
        <Card className="flex-1 p-3 bg-card/80 border-border/50 flex items-center gap-2">
          <AssetImage src={CURRENCY_ICON_ASSETS.coins} alt="Coins" className="w-6 h-6 icon-blend" />
          <span className="font-bold text-primary">{formatNumber(gameState.coins)}</span>
        </Card>
        <Card className="flex-1 p-3 bg-card/80 border-border/50 flex items-center gap-2">
          <AssetImage src={CURRENCY_ICON_ASSETS.diamonds} alt="Diamonds" className="w-6 h-6 icon-blend" />
          <span className="font-bold text-cyan-400">{formatNumber(gameState.diamonds)}</span>
        </Card>
      </div>

      {/* Shop Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full mb-4 bg-card/50">
          <TabsTrigger value="coins" className="flex-1 gap-1">
            <Coins size={16} weight="fill" /> Coins
          </TabsTrigger>
          <TabsTrigger value="diamonds" className="flex-1 gap-1">
            <Diamond size={16} weight="fill" /> Diamonds
          </TabsTrigger>
          <TabsTrigger value="special" className="flex-1 gap-1">
            <Gift size={16} weight="fill" /> Offers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="coins" className="mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {COIN_PACKS.map(item => (
              <ShopItemCard
                key={item.id}
                item={item}
                type="coins"
                onPurchase={handlePurchase}
                canAfford={gameState.diamonds >= item.price}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="diamonds" className="mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DIAMOND_PACKS.map(item => (
              <ShopItemCard
                key={item.id}
                item={item}
                type="diamonds"
                onPurchase={handlePurchase}
                canAfford={true} // Real money, always "affordable"
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="special" className="mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SPECIAL_OFFERS.map(item => (
              <ShopItemCard
                key={item.id}
                item={item}
                type="special"
                onPurchase={handlePurchase}
                canAfford={item.currency === 'real' || gameState.diamonds >= item.price}
              />
            ))}
          </div>
          <Card className="mt-4 p-4 bg-accent/10 border-accent/30 text-center">
            <Gift size={32} weight="fill" className="text-accent mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              More special offers coming soon!
            </p>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </ScrollArea>
  );
};
