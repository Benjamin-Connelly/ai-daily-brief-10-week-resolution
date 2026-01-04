import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Download, Upload, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ImportExportProps {
  onExport: () => string;
  onImport: (json: string) => boolean;
  onReset: () => void;
}

export const ImportExport = ({ onExport, onImport, onReset }: ImportExportProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [importText, setImportText] = useState('');

  const handleExport = () => {
    const json = onExport();
    navigator.clipboard.writeText(json);
    toast({
      title: 'Exported!',
      description: 'JSON copied to clipboard.',
    });
  };

  const handleDownload = () => {
    const json = onExport();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resolution-tracker-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: 'Downloaded!',
      description: 'JSON file saved.',
    });
  };

  const handleImport = () => {
    if (!importText.trim()) {
      toast({
        title: 'Error',
        description: 'Please paste JSON data first.',
        variant: 'destructive',
      });
      return;
    }
    
    const success = onImport(importText);
    if (success) {
      setImportText('');
      toast({
        title: 'Imported!',
        description: 'Data loaded successfully.',
      });
    } else {
      toast({
        title: 'Import failed',
        description: 'Invalid JSON format. Please check the data.',
        variant: 'destructive',
      });
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
      onReset();
      toast({
        title: 'Reset complete',
        description: 'All data has been cleared.',
      });
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-card">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <span className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Import / Export Data
        </span>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      
      {isOpen && (
        <div className="px-4 pb-4 space-y-4 border-t border-border">
          <div className="flex flex-wrap gap-2 pt-4">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Copy JSON
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download File
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset} className="text-destructive hover:text-destructive">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset All
            </Button>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Import JSON
            </label>
            <Textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Paste JSON data here..."
              className="min-h-[100px] font-mono text-xs bg-secondary/50"
            />
            <Button variant="default" size="sm" onClick={handleImport} disabled={!importText.trim()}>
              <Upload className="w-4 h-4 mr-2" />
              Import Data
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
