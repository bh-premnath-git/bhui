import { Input } from '@/components/ui/input';
import SendRoundedIcon from '@mui/icons-material/SendRounded';

export default function InputField({ question, setQuestion, handleSearch }) {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="p-4">
      <div className="max-w-3xl mx-auto">
        <div className="relative">
          <Input
            placeholder="Ask BigHammer AI"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full pr-12 py-4 text-lg rounded-full border-2 border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <SendRoundedIcon
            onClick={handleSearch}
            className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 text-indigo-500 hover:cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}