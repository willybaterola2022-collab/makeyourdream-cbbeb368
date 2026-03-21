import { SkillNodeData, BRANCH_META, SkillBranch } from "./skillTreeData";
import { SkillNode } from "./SkillNode";

interface SkillBranchProps {
  branch: SkillBranch;
  nodes: SkillNodeData[];
  onNodeClick: (node: SkillNodeData) => void;
}

export function SkillBranchComponent({ branch, nodes, onNodeClick }: SkillBranchProps) {
  const meta = BRANCH_META[branch];
  const sorted = [...nodes].sort((a, b) => a.order - b.order);
  const completed = sorted.filter((n) => n.status === "completed").length;
  const pct = Math.round((completed / sorted.length) * 100);

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Branch completion % */}
      <div className="flex items-center gap-2 mb-2">
        <div className="h-1.5 w-16 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: meta.color }}
          />
        </div>
        <span
          className="text-[10px] font-bold"
          style={{ color: meta.color, fontFamily: "'JetBrains Mono', monospace" }}
        >
          {pct}%
        </span>
      </div>

      {sorted.map((node, i) => (
        <div key={node.id} className="flex flex-col items-center">
          {/* Connection line from previous node */}
          {i > 0 && (
            <svg width="6" height="48" className="my-0.5">
              {node.status === "coming-soon" || sorted[i - 1].status === "coming-soon" ? (
                <line x1="3" y1="0" x2="3" y2="48" stroke="#2D2D44" strokeWidth="2" strokeDasharray="4 4" />
              ) : node.status === "locked" ? (
                <line x1="3" y1="0" x2="3" y2="48" stroke="#2D2D44" strokeWidth="2" />
              ) : node.isBoss ? (
                <>
                  <defs>
                    <linearGradient id={`boss-line-${node.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FFA502" />
                      <stop offset="100%" stopColor="#FFD700" />
                    </linearGradient>
                  </defs>
                  <line x1="3" y1="0" x2="3" y2="48" stroke={`url(#boss-line-${node.id})`} strokeWidth="3" />
                </>
              ) : (
                <>
                  <defs>
                    <linearGradient id={`line-${node.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FF3CAC" />
                      <stop offset="50%" stopColor="#784BA0" />
                      <stop offset="100%" stopColor="#2B86C5" />
                    </linearGradient>
                  </defs>
                  <line x1="3" y1="0" x2="3" y2="48" stroke={`url(#line-${node.id})`} strokeWidth="2" />
                  {/* 3 staggered particles */}
                  {[0, 0.6, 1.3].map((delay, pi) => (
                    <circle key={pi} cx="3" cy="0" r="2.5" fill="#FF3CAC" opacity="0.8">
                      <animateMotion dur="2s" repeatCount="indefinite" path="M0,0 L0,48" begin={`${delay}s`} />
                    </circle>
                  ))}
                </>
              )}
            </svg>
          )}
          <SkillNode node={node} index={i} onClick={onNodeClick} />
        </div>
      ))}
    </div>
  );
}
