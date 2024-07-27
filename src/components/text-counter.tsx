import React from 'react';
import Typography from '@mui/material/Typography';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

const TextWithIcon = ({ text }) => {
  // Function to count words
  const countWords = (str) => {
    return str.split(/\s+/).filter(Boolean).length;
  };

  return (
    <div>
      <Typography variant="body1">
        {text}
        {/* Conditionally display the icon if more than 100 words */}
        {countWords(text) > 100 && <FiberManualRecordIcon style={{ verticalAlign: 'middle' }} />}
      </Typography>
    </div>
  );
};

export default TextWithIcon;
