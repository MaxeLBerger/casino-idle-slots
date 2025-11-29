import { CURRENCY_ICON_ASSETS } from '@/constants/economy.constants';
import { UI_ICON_ASSETS } from '@/constants/ui.constants';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface UpgradeItemProps {
  title: string;
  description: string;
  level: number;
  cost: number;
  onUpgrade: () => void;
  disabled: boolean;
}

function UpgradeItem({ title, description, level, cost, onUpgrade, disabled }: UpgradeItemProps) {
  const coinIcon = CURRENCY_ICON_ASSETS.coins;

  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#050317]/80 border border-[#312556]">
      <div className="w-10 h-10 rounded-xl bg-[#0b0418] flex items-center justify-center overflow-hidden">
        {UI_ICON_ASSETS.upgradeMenu && (
          <img src={UI_ICON_ASSETS.upgradeMenu} alt="Upgrade" className="w-7 h-7 object-contain icon-blend" loading="lazy" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className="text-sm font-semibold text-white truncate">{title}</span>
          <span className="text-[11px] text-cyan-200/80">Lv. {level}</span>
        </div>
        <p className="text-[11px] text-slate-300/80 line-clamp-2">{description}</p>
      </div>
      <Button
        type="button"
        size="sm"
        onClick={onUpgrade}
        disabled={disabled}
        className="flex flex-col items-center justify-center px-3 py-2 rounded-2xl bg-gradient-to-b from-amber-300 via-amber-400 to-orange-500 text-[#050317] text-[11px] font-semibold shadow-[0_0_14px_rgba(251,191,36,0.8)] disabled:opacity-50 disabled:shadow-none min-w-[70px]"
      >
        <div className="flex items-center gap-1">
          {coinIcon && (
            <img src={coinIcon} alt="Coins" className="w-3.5 h-3.5 object-contain icon-blend" loading="lazy" />
          )}
          <span>{cost.toLocaleString()}</span>
        </div>
        <span className="uppercase tracking-[0.12em] mt-0.5">Upgrade</span>
      </Button>
    </div>
  );
}

interface UpgradesPanelProps {
  spinLevel: number;
  spinCost: number;
  idleLevel: number;
  idleCost: number;
  onUpgradeSpin: () => void;
  onUpgradeIdle: () => void;
  canAffordSpin: boolean;
  canAffordIdle: boolean;
}

export function UpgradesPanel(props: UpgradesPanelProps) {
  return (
    <Card className="p-4 bg-[#02010d]/90 border-[#312556] space-y-3">
      <div className="flex items-center gap-2 mb-1">
        {UI_ICON_ASSETS.upgradeMenu && (
          <img src={UI_ICON_ASSETS.upgradeMenu} alt="Upgrades" className="w-5 h-5 object-contain icon-blend" loading="lazy" />
        )}
        <h2 className="text-sm font-semibold tracking-[0.14em] uppercase text-slate-100">Upgrades</h2>
      </div>
      <UpgradeItem
        title="Spin Power"
        description="Boost every spin with a higher win multiplier."
        level={props.spinLevel}
        cost={props.spinCost}
        onUpgrade={props.onUpgradeSpin}
        disabled={!props.canAffordSpin}
      />
      <UpgradeItem
        title="Idle Income"
        description="Earn coins per second while you relax in the lounge."
        level={props.idleLevel}
        cost={props.idleCost}
        onUpgrade={props.onUpgradeIdle}
        disabled={!props.canAffordIdle}
      />
    </Card>
  );
}
