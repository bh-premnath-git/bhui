// components/DateDisplay.tsx
import React from 'react';
import { formatDate } from '../Utils/dateFormatter';

interface DateDisplayProps {
    dateString: string;
}

const DateDisplay: React.FC<DateDisplayProps> = ({ dateString }) => {
    return <div>{formatDate(dateString)}</div>;
};

export default DateDisplay;
