"use client";

import { ExternalLinkIcon, FileTextIcon } from "lucide-react";
import { type FC } from "react";
import { cn } from "@/lib/utils";

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

// Placeholder component for [doc-(id)] patterns
export const DocPlaceholder: FC<DocPlaceholderProps> = ({ 
  id, 
  className, 
  onClick 
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) {
      onClick(id);
    } else {
      // Default behavior - you can customize this
      console.log(`Opening document with ID: ${id}`);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "aui-doc-placeholder inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-sm font-medium text-primary hover:bg-primary/20 transition-colors border border-primary/20 hover:border-primary/30",
        className
      )}
      title={`Open document: ${id}`}
    >
      <FileTextIcon className="h-3 w-3" />
      <span>Doc: {id}</span>
    </button>
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
        "aui-link-placeholder inline-flex items-center gap-1 rounded-md bg-primary/5 px-2 py-1 text-sm font-medium text-primary/80 hover:bg-primary/10 hover:text-primary transition-colors border border-primary/15 hover:border-primary/25",
        className
      )}
      title={`Open link: ${url}`}
    >
      <ExternalLinkIcon className="h-3 w-3" />
      <span>{getDomain(url)}</span>
    </button>
  );
};