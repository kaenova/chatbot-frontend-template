"use client";

import { Download, ExternalLinkIcon, FileTextIcon } from "lucide-react";
import { type FC, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChunkData, getChunkData } from "@/lib/integration/client/chunk";

// Props for the doc placeholder component
interface DocPlaceholderProps {
  id: string;
  className?: string;
  onClick?: (id: string) => void;
}

// Props for the link placeholder component
interface LinkPlaceholderProps {
  url: string;
  className?: string;
}

export const DocPlaceholder: FC<DocPlaceholderProps> = ({
  id,
  className,
  onClick
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<ChunkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getChunkData(id);
        setData(data);
      } catch (err) {
        console.error('Error fetching chunk data:', err);
        setError('Failed to load document info');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) {
      onClick(id);
      return;
    }
    setIsOpen(true);
  };

  const handleDownload = () => {
    if (data && data.file_url) {
      const link = document.createElement('a');
      link.href = data.file_url;
      link.download = data.metadata.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const buttonText = loading ? 'Loading...' :
  data ? `${(data as ChunkData).metadata.filename} (Chunk ${(data as ChunkData).metadata.chunk_index})` :  
  `Doc: ${id}` 
    

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        className={cn(
          "aui-link-placeholder inline-flex items-center gap-1 rounded-md bg-primary/5 px-2 py-1 text-sm font-medium text-primary/80 hover:bg-primary/10 hover:text-primary transition-colors border border-primary/15 hover:border-primary/25 mx-2", 
          loading && 'cursor-not-allowed opacity-60',
          className
        )}
        title={`Open document: ${id}`}
      >
        <FileTextIcon className="h-3 w-3" />
        <span>{buttonText}</span>
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="md:max-w-3xl max-w-lg w-full">
          <DialogHeader>
            <DialogTitle>Document Details</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p>{error}</p>
            ) : data ? (
              <>
                <div className="mb-2">
                  <strong>File Name:</strong> {data.metadata.filename} <br />
                  <strong>Chunk Number:</strong> {data.metadata.chunk_index}
                </div>
                <pre className="whitespace-pre-wrap text-sm bg-gray-100 p-2 rounded-lg max-h-64 overflow-scroll">{data.content}</pre>
                {data.file_url && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={handleDownload}
                      className="inline-flex items-center gap-2 rounded-md bg-primary/5 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 transition-colors border border-primary/20 hover:border-primary/30"
                    >
                      <Download className="h-4 w-4" />
                      Download Full File
                    </button>
                  </div>
                )}
              </>
            ) : (
              <p>No data available</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Placeholder component for [link-(url)] patterns
export const LinkPlaceholder: FC<LinkPlaceholderProps> = ({ 
  url, 
  className 
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Extract domain for display
  const getDomain = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch {
      return url.length > 30 ? url.substring(0, 30) + '...' : url;
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "aui-link-placeholder inline-flex items-center gap-1 rounded-md bg-primary/5 px-2 py-1 text-sm font-medium text-primary/80 hover:bg-primary/10 hover:text-primary transition-colors border border-primary/15 hover:border-primary/25 mx-2",
        className
      )}
      title={`Open link: ${url}`}
    >
      <ExternalLinkIcon className="h-3 w-3" />
      <span>{getDomain(url)}</span>
    </button>
  );
};