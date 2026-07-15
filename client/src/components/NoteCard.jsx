import React from 'react';
import { Card } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2, BookOpen, Clock, FileText } from 'lucide-react';

const TAG_STYLES = {
  LECTURE_NOTES: { label: 'Lecture Notes', variant: 'info' },
  SUMMARY: { label: 'Summary', variant: 'safe' },
  FORMULA_SHEET: { label: 'Formula Sheet', variant: 'warning' },
  REVISION: { label: 'Revision', variant: 'info' },
  GENERAL: { label: 'General', variant: 'neutral' },
};

const NoteCard = ({ note, onEdit, onDelete, currentUserId }) => {
  const tagInfo = TAG_STYLES[note.tag] || TAG_STYLES.GENERAL;
  const isOwner = note.studentId === currentUserId;

  return (
    <Card className="flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant="info" icon={BookOpen}>
              {note.subject?.code || 'SUB'}
            </Badge>
            <Badge variant={tagInfo.variant} showIcon={false}>
              {tagInfo.label}
            </Badge>
          </div>
          <span className="mono text-[11px] font-semibold bg-surface-2 px-2 py-0.5 rounded border border-border">
            Sem {note.semesterNo}
          </span>
        </div>
        <h3 className="text-base font-semibold text-foreground leading-snug line-clamp-2 mb-2">
          {note.title}
        </h3>
        <p className="text-sm text-text-muted whitespace-pre-wrap leading-relaxed line-clamp-5">
          {note.content}
        </p>
      </div>

      <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-text-soft mt-4">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {new Date(note.updatedAt).toLocaleDateString()}
        </span>
        {isOwner && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(note)}
              className="h-7 px-2"
            >
              <Edit2 className="w-3 h-3 mr-1" /> Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(note.id)}
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

export default NoteCard;
export { NoteCard };
