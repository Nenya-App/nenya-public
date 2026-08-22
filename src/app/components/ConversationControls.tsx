import { useState } from 'react';
import { Button } from './ui/button';
import { Trash2, Download, Flag, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface ConversationControlsProps {
  onClearConversation?: () => void;
  conversationText: string;
  conversationName?: string;
}

export function ConversationControls({ 
  onClearConversation, 
  conversationText,
  conversationName = 'nenya-conversation'
}: ConversationControlsProps) {
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showBookmarkDialog, setShowBookmarkDialog] = useState(false);

  const handleSave = () => {
    setShowSaveDialog(true);
  };

  const handleClear = () => {
    setShowClearDialog(true);
  };

  const handleReport = () => {
    setShowReportDialog(true);
  };

  const handleBookmark = () => {
    setShowBookmarkDialog(true);
  };

  const confirmClear = () => {
    if (onClearConversation) {
      onClearConversation();
    }
    setShowClearDialog(false);
  };

  return (
    <>
      <div className="flex gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={handleClear}
          className="gap-2"
        >
          <Trash2 className="size-4" />
          <span className="hidden sm:inline">Clear</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSave}
          className="gap-2"
        >
          <Download className="size-4" />
          <span className="hidden sm:inline">Save</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReport}
          className="gap-2"
        >
          <Flag className="size-4" />
          <span className="hidden sm:inline">Report</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleBookmark}
          className="gap-2"
        >
          <Clock className="size-4" />
          <span className="hidden sm:inline">Bookmark</span>
        </Button>
      </div>

      {/* Clear Dialog */}
      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear Conversation</DialogTitle>
            <DialogDescription>
              This action would clear the current conversation from your session and reset the interface.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p>
              <strong>In the full Nenya application:</strong> This would immediately remove all messages from your active memory. The conversation would be permanently deleted unless you've saved it first.
            </p>
            <p className="text-muted-foreground">
              This helps you maintain privacy by ensuring old conversations don't persist in memory longer than needed.
            </p>
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="ghost" onClick={() => setShowClearDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmClear}>
              Clear Conversation
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Conversation</DialogTitle>
            <DialogDescription>
              This action would save the current conversation as a plain text (.txt) file to your device.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p>
              <strong>In the full Nenya application:</strong> The conversation would be downloaded directly to your device as a text file. The file would contain only the conversation content with timestamps - no additional metadata.
            </p>
            <p className="text-muted-foreground">
              <strong>Privacy Note:</strong> Once saved to your device, this file is your responsibility. Nenya retains no copy of the saved conversation on its servers.
            </p>
            <p className="text-muted-foreground">
              <strong>Saved file location:</strong> The file would be saved to your device's default download folder with the name "{conversationName}-{new Date().toISOString().split('T')[0]}.txt"
            </p>
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="ghost" onClick={() => setShowSaveDialog(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report AI Behavior</DialogTitle>
            <DialogDescription>
              Submit feedback about Nenya's AI responses to help us improve the system.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p>
              <strong>This reporting system is primarily for:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Reporting AI responses that seem unhelpful or off-target</li>
              <li>Submitting conversations as training data</li>
              <li>Reporting technical issues or unexpected behavior</li>
              <li>General feedback about your experience</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              <strong>For Dyadic Cells:</strong> If you need to report concerning behavior from another user, you can include their anonymous hex code and describe the issue. Reports are reviewed by human moderators while maintaining privacy through hex code anonymity.
            </p>
            <p className="text-muted-foreground">
              <strong>For immediate safety needs:</strong> Use the Eagle Protocol instead.
            </p>
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="ghost" onClick={() => setShowReportDialog(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bookmark Dialog */}
      <Dialog open={showBookmarkDialog} onOpenChange={setShowBookmarkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bookmark Conversation</DialogTitle>
            <DialogDescription>
              This action would set an internal reminder timer for this conversation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p>
              <strong>In the full Nenya application:</strong> The conversation would be held in temporary memory with a reminder notification:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Default timer:</strong> 2 hours</li>
              <li><strong>Reminder:</strong> You'd receive a notification asking if you want to save or extend the bookmark</li>
              <li><strong>Auto-purge:</strong> If no action is taken, the conversation is automatically deleted after the timer expires</li>
            </ul>
            <p className="text-muted-foreground">
              <strong>Privacy Note:</strong> This feature lets you temporarily preserve a conversation without committing to saving it permanently. It's useful when you're still processing a session and might want to revisit it, but don't want it persisting indefinitely in memory.
            </p>
            <p className="text-muted-foreground">
              <strong>You can:</strong> Extend the bookmark, save the conversation permanently, or let it auto-purge when the timer expires.
            </p>
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="ghost" onClick={() => setShowBookmarkDialog(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
