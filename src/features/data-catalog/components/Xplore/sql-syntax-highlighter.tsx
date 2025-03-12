import { useEffect, useRef } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-sql';
import 'prismjs/themes/prism-tomorrow.css';

interface SqlSyntaxHighlighterProps {
  code: string;
  className?: string;
}

export function SqlSyntaxHighlighter({ code, className }: SqlSyntaxHighlighterProps) {
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [code]);

  return (
    <pre className={className}>
      <code ref={codeRef} className="language-sql">
        {code}
      </code>
    </pre>
  );
}
