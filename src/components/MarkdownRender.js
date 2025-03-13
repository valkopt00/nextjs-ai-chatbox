import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coy } from "react-syntax-highlighter/dist/cjs/styles/prism";

const MarkdownRender = ({ node, inline, className, children, ...props }) => {
  const match = /language-(\w+)/.exec(className || "");
  return !inline && match ? (
    <SyntaxHighlighter 
      style={{ 
        ...coy,
        'code[class*="language-"]': {
          color: '#f8f8f2',
          background: 'none',
          textShadow: '0 1px rgba(0, 0, 0, 0.3)',
          fontFamily: "Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace",
          fontSize: '1em',
          textAlign: 'left',
          whiteSpace: 'pre',
          lineHeight: '1.5',
          MozTabSize: '4',
          OTabSize: '4',
          tabSize: '4',
          WebkitHyphens: 'none',
          MozHyphens: 'none',
          msHyphens: 'none',
          hyphens: 'none'
        },
        'pre[class*="language-"]': {
          color: '#f8f8f2',
          background: '#282a36',
          textShadow: '0 1px rgba(0, 0, 0, 0.3)',
          fontFamily: "Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace",
          fontSize: '1em',
          textAlign: 'left',
          whiteSpace: 'pre',
          lineHeight: '1.5',
          MozTabSize: '4',
          OTabSize: '4',
          tabSize: '4',
          WebkitHyphens: 'none',
          MozHyphens: 'none',
          msHyphens: 'none',
          hyphens: 'none',
          padding: '1em',
          margin: '.5em 0',
          overflow: 'auto',
          borderRadius: '0.3em'
        },
        ':not(pre) > code[class*="language-"]': {
          background: '#282a36',
          padding: '.1em',
          borderRadius: '.3em',
          whiteSpace: 'normal'
        },
        comment: { color: '#6272a4' },
        prolog: { color: '#6272a4' },
        doctype: { color: '#6272a4' },
        cdata: { color: '#6272a4' },
        punctuation: { color: '#f8f8f2' },
        property: { color: '#ff79c6' },
        tag: { color: '#ff79c6' },
        constant: { color: '#bd93f9' },
        symbol: { color: '#bd93f9' },
        deleted: { color: '#bd93f9' },
        boolean: { color: '#bd93f9' },
        number: { color: '#bd93f9' },
        selector: { color: '#50fa7b' },
        'attr-name': { color: '#50fa7b' },
        string: { color: '#f1fa8c' },
        char: { color: '#f1fa8c' },
        builtin: { color: '#f1fa8c' },
        inserted: { color: '#f1fa8c' },
        operator: { color: '#ff79c6' },
        entity: { color: '#f8f8f2', cursor: 'help' },
        url: { color: '#f8f8f2' },
        variable: { color: '#f8f8f2' },
        atrule: { color: '#ff79c6' },
        'attr-value': { color: '#f1fa8c' },
        function: { color: '#50fa7b' },
        'class-name': { color: '#8be9fd' },
        keyword: { color: '#ff79c6' },
        regex: { color: '#ffb86c' },
        important: { color: '#ffb86c', fontWeight: 'bold' },
        bold: { fontWeight: 'bold' },
        italic: { fontStyle: 'italic' }
      }} 
      language={match[1]} 
      {...props}
    >
      {String(children).replace(/\n$/, "")}
    </SyntaxHighlighter>
  ) : (
    <code className={`${className} bg-gray-800 px-1 py-0.5 rounded`} {...props}>
      {children}
    </code>
  );
};

export default MarkdownRender;
