import React from 'react';
import { Card } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Pin, Video, FileText, Folder, Link as LinkIcon, Edit2, Trash2, ShieldCheck } from 'lucide-react';

const TYPE_ICONS = {
  YOUTUBE: { icon: Video, label: 'YouTube Video', variant: 'warning' },
  ARTICLE: { icon: FileText, label: 'Article / Docs', variant: 'info' },
  GOOGLE_DRIVE: { icon: Folder, label: 'Google Drive', variant: 'safe' },
  OTHER: { icon: LinkIcon, label: 'Web Link', variant: 'neutral' },
};

const LinkCard = ({ resource, onEdit, onDelete, currentUserId, isAdmin }) => {
  const typeInfo = TYPE_ICONS[resource.type] || TYPE_ICONS.OTHER;
  const canModify = resource.addedById === currentUserId || (isAdmin && resource.isPinned);

  return (
    <Card className={resource.isPinned ? 'border-l-4 border-l-chalk-teal border-border' : 'border border-border'}>
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {resource.isPinned && (
              <Badge variant="warning" icon={Pin}>
                Pinned
              </Badge>
            )}
            <Badge variant="info" showIcon={false}>
              {resource.subject?.code || 'SUB'}
            </Badge>
            <Badge variant={typeInfo.variant} icon={typeInfo.icon}>
              {typeInfo.label}
            </Badge>
          </div>
          <span className="mono text-[11px] font-semibold bg-surface-2 px-2 py-0.5 rounded border border-border">
            Sem {resource.semesterNo}
          </span>
        </div>
        <h3 className="text-base font-semibold text-foreground leading-snug line-clamp-2 mb-3">
          {resource.title}
        </h3>
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-semibold text-ink dark:text-chalk-teal hover:underline break-all"
        >
          <span>Open Resource URL</span>
          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
        </a>
      </div>

      <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-text-soft mt-4">
        <span className="flex items-center gap-1 truncate">
          {resource.isPinned ? (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-status-warning" />
              <span className="font-semibold text-foreground">Curated by Faculty</span>
            </>
          ) : (
            <span>Added by Student</span>
          )}
        </span>

        {canModify && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(resource)}
              className="h-7 px-2"
            >
              <Edit2 className="w-3 h-3 mr-1" /> Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(resource.id, resource.isPinned)}
              className="h-7 px-2 text-status-critical hover:bg-status-critical/10"
            >
              <Trash2 className="w-3 h-3 mr-1" /> Delete
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default LinkCard;
export { LinkCard };
