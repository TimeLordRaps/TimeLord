// components/CodeEditor.tsx
import React from 'react';
import MonacoEditor from 'react-monaco-editor';

interface CodeEditorProps {
  language: string;
  code: string;
  onChange: (value: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ language, code, onChange }) => {
  const options = {
    selectOnLineNumbers: true,
    renderIndentGuides: true,
    colorDecorators: true,
    wordWrap: "on",
    autoIndent: 'full',
    formatOnPaste: true,
    formatOnType: true,
    folding: true,
    lineNumbersMinChars: 3,
    scrollBeyondLastLine: false,
    automaticLayout: true,
  };

  return (
    <MonacoEditor
      language={language}
      theme="vs-dark"
      value={code}
      options={options}
      onChange={onChange}
      editorDidMount={(editor) => {
        editor.focus();
      }}
    />
  );
};

export default CodeEditor;