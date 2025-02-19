import { format } from 'date-fns';

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
  