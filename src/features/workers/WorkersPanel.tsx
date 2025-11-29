import { WORKER_ROLE_ASSETS } from '@/constants/workers.constants';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AssetImage } from '@/components/ui/asset-image';

interface WorkerCardProps {
  id: string;
  role: keyof typeof WORKER_ROLE_ASSETS;
  level: number;
  description: string;
}

function WorkerCard({ id, role, level, description }: WorkerCardProps) {
  const icon = WORKER_ROLE_ASSETS[role];

  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#050317]/80 border border-[#312556]">
      <div className="w-10 h-10 rounded-xl bg-[#0b0418] flex items-center justify-center overflow-hidden">
        {icon && (
          <AssetImage src={icon} alt={role} className="w-7 h-7 object-contain" loading="lazy" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className="text-sm font-semibold text-white truncate">{id}</span>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 border-[#4ade80]/40 text-[#bbf7d0] bg-[#052e16]">
            Lv. {level}
          </Badge>
        </div>
        <p className="text-[11px] text-slate-300/80 line-clamp-2">{description}</p>
      </div>
    </div>
  );
}

interface WorkersPanelProps {
  workers: Array<{ id: string; role: keyof typeof WORKER_ROLE_ASSETS; level: number; description: string }>;
}

export function WorkersPanel({ workers }: WorkersPanelProps) {
  return (
    <Card className="p-4 bg-[#02010d]/90 border-[#312556] space-y-3">
      <h2 className="text-sm font-semibold tracking-[0.14em] uppercase text-slate-100 mb-1">Idle Workers</h2>
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {workers.map((worker) => (
          <WorkerCard key={worker.id} {...worker} />
        ))}
      </div>
    </Card>
  );
}
