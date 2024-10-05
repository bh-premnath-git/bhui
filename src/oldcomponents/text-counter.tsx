import Typography from '@mui/material/Typography';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

const TextWithIcon = ({ text }: { text: string }) => {
  // Function to count words
  const countWords = (str: string) => {
    if (str === null || str === undefined) {
      return 0;
    }

    return str.split(/\s+/).filter(Boolean).length;
  };

  return (
    <div>
      <Typography variant="body1">
        {/* Handle null or undefined text */}
        {text === null || text === undefined ? '' : text}
        {/* Conditionally display the icon if more than 100 words */}
        {countWords(text) > 100 && <FiberManualRecordIcon style={{ verticalAlign: 'middle' }} />}
      </Typography>
    </div>
  );
};

export default TextWithIcon;
