import { useState, useRef } from "react";
import { FieldProps } from "formik";

interface TextareaProps extends FieldProps {
  placeholder?: string;
}

const Textarea: React.FC<TextareaProps> = ({ field, form, placeholder }) => {
  const [lineNumbers, setLineNumbers] = useState([1]);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    field.onChange(e); // Update Formik state
    setValue(val); // You may need to move this state up if it affects the rendering
    updateLineNumbers(val);
  };

  const updateLineNumbers = (val: string) => {
    const lines = val.split("\n").length;
    const linesArray = Array.from({ length: lines }, (_, i) => i + 1);
    setLineNumbers(linesArray);
  };

  const syncScroll = () => {
    if (textAreaRef.current) {
      const lineNumberElement = document.getElementById("line-numbers");
      if (lineNumberElement) {
        lineNumberElement.scrollTop = textAreaRef.current.scrollTop;
      }
    }
  };

  return (
    <div className="relative w-full flex border border-gray-300 rounded-md">
      {/* Line Numbers */}
      <div
        id="line-numbers"
        className="left-0 top-0 bottom-0 h-64 w-10 p-2 text-right bg-gray-50 text-green-600 border-r border-gray-300 overflow-hidden select-none"
      >
        {lineNumbers.map((line) => (
          <div key={line} className="h-5 leading-5">
            {line}
          </div>
        ))}
      </div>

      {/* Text Area */}
      <textarea
        ref={textAreaRef}
        className="w-full h-64 p-2 pl-14 bg-white resize-none focus:outline-none"
        {...field} // Spread Formik field props
        placeholder={placeholder}
        onChange={handleInputChange} // Use the custom handler
        onScroll={syncScroll}
        rows={10}
      />
    </div>
  );
};

export default Textarea;
