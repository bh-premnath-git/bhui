import { format, differenceInMinutes } from 'date-fns';

export function formatDate(
    dateInput: Date | number | string,
    dateFormat: string = 'PPpp'
  ): string {
    let date: Date;
  
    // Convert the input to a Date object
    if (typeof dateInput === 'number') {
      // Check if the epoch number is in seconds (10 digits) and convert to milliseconds if so
      const epochString = dateInput.toString();
      date = new Date(epochString.length === 10 ? dateInput * 1000 : dateInput);
    } else if (typeof dateInput === 'string') {
      date = new Date(dateInput);
    } else {
      date = dateInput;
    }
  
    // Check for an invalid date
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date input');
    }
  
    // Return the formatted date string
    return format(date, dateFormat);
  }

export function formatDuration(
    startTime: Date | number | string,
    endTime: Date | number | string
  ): string {
    if (!startTime || !endTime) {
      return '0 min';
    }
  
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    const diffMinutes = differenceInMinutes(endDate, startDate);
  
    if (isNaN(diffMinutes) || diffMinutes < 0) {
      return '0 min';
    }
  
    return `${diffMinutes} min`;
  }

  
export const formatTimestamp = (timestamp: string) => {
  try {
    const date = new Date(timestamp)
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return timestamp // Return original if invalid
    }
    
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    
    return `${day}/${month}/${year}`
  } catch (error) {
    return timestamp // Return original if parsing fails
  }
}
