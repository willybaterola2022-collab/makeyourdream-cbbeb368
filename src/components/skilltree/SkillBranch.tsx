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

  return (
    <div className="flex flex-col items-center gap-1">
      {sorted.map((node, i) => (
        <div key={node.id} className="flex flex-col items-center">
          {/* Connection line from previous node */}
          {i > 0 && (
            <svg width="4" height="32" className="my-0.5">
              {node.status === "coming-soon" || sorted[i - 1].status === "coming-soon" ? (
                <line x1="2" y1="0" x2="2" y2="32" stroke="#2D2D44" strokeWidth="2" strokeDasharray="4 4" />
              ) : node.status === "locked" ? (
                <line x1="2" y1="0" x2="2" y2="32" stroke="#2D2D44" strokeWidth="2" />
              ) : (
                <>
                  <defs>
                    <linearGradient id={`line-${node.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FF3CAC" />
                      <stop offset="50%" stopColor="#784BA0" />
                      <stop offset="100%" stopColor="#2B86C5" />
                    </linearGradient>
                  </defs>
                  <line x1="2" y1="0" x2="2" y2="32" stroke={`url(#line-${node.id})`} strokeWidth="2" />
                  {/* Particle dot */}
                  <circle r="2" fill="#FF3CAC">
                    <animateMotion dur="2s" repeatCount="indefinite" path="M2,0 L2,32" />
                  </circle>
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
