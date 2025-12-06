import React, { useRef, useState, useEffect } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  rows?: number;
  className?: string;
  borderColor?: string;
  suggestions?: string[];
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  label,
  placeholder,
  className = '',
  borderColor = 'border-gray-300',
  suggestions = [],
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<any>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionList, setSuggestionList] = useState<string[]>([]);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // Initialize Quill
  useEffect(() => {
    if (editorRef.current && !quillRef.current && window.Quill) {
      quillRef.current = new window.Quill(editorRef.current, {
        theme: 'snow',
        placeholder: placeholder,
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'color': [] }],
            ['link', 'clean']
          ]
        }
      });

      // Set initial value
      if (value) {
        quillRef.current.clipboard.dangerouslyPasteHTML(value);
      }

      // Handle text change
      quillRef.current.on('text-change', () => {
        const html = quillRef.current.root.innerHTML;
        // Quill returns <p><br></p> for empty state, which we want to treat as empty string
        onChange(html === '<p><br></p>' ? '' : html);
        
        handleSuggestions();
      });
    }
  }, []); // Run once on mount

  // Watch for external value changes (e.g., reset)
  useEffect(() => {
    if (quillRef.current) {
        const currentContent = quillRef.current.root.innerHTML;
        // Only update if value is empty (reset) and current content is not empty
        if ((value === '' || value === undefined) && currentContent !== '<p><br></p>' && currentContent !== '') {
            quillRef.current.setText('');
        }
    }
  }, [value]);

  const handleSuggestions = () => {
    if (!suggestions || suggestions.length === 0) return;
    
    const range = quillRef.current.getSelection();
    if (!range) return;
    
    // Do not show suggestions if text is selected
    if (range.length > 0) {
        setShowSuggestions(false);
        return; 
    }

    const text = quillRef.current.getText();
    const cursorIndex = range.index;
    
    // Find start of current word
    let start = cursorIndex;
    while (start > 0 && text[start - 1] !== ' ' && text[start - 1] !== '\n') {
        start--;
    }
    const currentWord = text.substring(start, cursorIndex);
    
    if (currentWord.length > 1) {
        const matches = suggestions.filter(s => 
          s.toLowerCase().startsWith(currentWord.toLowerCase()) && 
          s.toLowerCase() !== currentWord.toLowerCase()
        );
        
        if (matches.length > 0) {
            const bounds = quillRef.current.getBounds(cursorIndex);
            // bounds returns position relative to the editor container
            setSuggestionList(matches);
            setPosition({ top: bounds.bottom + 5, left: bounds.left });
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    } else {
        setShowSuggestions(false);
    }
  };

  const applySuggestion = (suggestionText: string) => {
    const range = quillRef.current.getSelection();
    if (!range) return;
    
    const cursor = range.index;
    const allText = quillRef.current.getText();
    
    let start = cursor;
    while (start > 0 && allText[start - 1] !== ' ' && allText[start - 1] !== '\n') {
        start--;
    }
    
    // Delete typed word
    quillRef.current.deleteText(start, cursor - start);
    // Insert suggestion
    quillRef.current.insertText(start, suggestionText + ' ');
    // Move cursor to end of inserted text
    quillRef.current.setSelection(start + suggestionText.length + 1);
    
    setShowSuggestions(false);
  };

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      
      <div className={`relative bg-white rounded-lg ${borderColor.startsWith('border-') ? borderColor : `border-${borderColor}`}`}>
         {/* Quill attaches toolbar here automatically or we can customize container. 
             We let Quill attach toolbar to this container div because we passed it as container */}
         <div className={`border rounded-lg overflow-hidden ${borderColor.startsWith('border-') ? borderColor : `border-${borderColor}`}`}>
            <div ref={editorRef} className="bg-white min-h-[100px] text-gray-900" />
         </div>

         {/* Suggestion Dropdown */}
         {showSuggestions && suggestionList.length > 0 && (
            <div 
              className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto min-w-[150px]"
              style={{ top: position.top + 45, left: position.left }} // Offset for toolbar height roughly
            >
              {suggestionList.map((suggestion) => (
                <div
                  key={suggestion}
                  className="px-3 py-2 hover:bg-brand-50 cursor-pointer text-sm text-gray-700 transition-colors"
                  onMouseDown={(e) => {
                    e.preventDefault(); // Prevent losing focus from editor
                    applySuggestion(suggestion);
                  }}
                >
                  {suggestion}
                </div>
              ))}
            </div>
         )}
      </div>
    </div>
  );
};