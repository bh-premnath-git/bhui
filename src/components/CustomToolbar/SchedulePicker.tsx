import React, { useRef, useState } from 'react';
import { Clock, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IntervalModalComponent, IntervalModalRef, IntervalState } from '@/components/IntervalModal';

const convertToCron = (interval: IntervalState): string => {
  const [hours, minutes] = interval.repeatAt.split(':').map(Number);
  
  switch (interval.selectedInterval.toLowerCase()) {
    case 'minutes':
      return `*/${interval.repeatEvery} * * * *`;
      
    case 'hourly':
      return `${minutes} */${interval.repeatEvery} * * *`;
      
    case 'daily':
      return `${minutes} ${hours} * * *`;
      
    case 'weekly': {
      const days = interval.selectedDays.map(day => {
        const dayMap: Record<string, number> = {
          'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6
        };
        return dayMap[day];
      }).sort().join(',');
      return `${minutes} ${hours} * * ${days || '*'}`;
    }
    
    case 'monthly':
      return `${minutes} ${hours} ${interval.selectedDate} * *`;
      
    case 'yearly': {
      const monthNum = months.indexOf(interval.selectedMonth) + 1;
      return `${minutes} ${hours} ${interval.selectedDate} ${monthNum} *`;
    }
    
    default:
      return '* * * * *';
  }
};

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const defaultState: IntervalState = {
  selectedInterval: "daily",
  repeatEvery: "1",
  repeatAt: "00:00",
  selectedDays: [],
  selectedMonth: "January",
  selectedDate: "1"
};

const SchedulePicker = ({ value, onChange }) => {
  const intervalModalRef = useRef<IntervalModalRef>(null);
  const [cronExpression, setCronExpression] = useState<string>(value || "* * * * *");
  const [currentState, setCurrentState] = useState<IntervalState>(defaultState);
  
  const handleIntervalSave = (intervalString: string) => {
    const interval = JSON.parse(intervalString);
    const cron = convertToCron(interval);
    setCronExpression(cron);
    setCurrentState(interval);
    onChange(intervalString);
  };

  const handleClear = () => {
    setCronExpression("* * * * *");
    setCurrentState(defaultState);
    onChange(JSON.stringify(defaultState));
  };

  return (
    <div className="relative">
      <div className="relative">
        <Input
          value={cronExpression}
          readOnly
          className="pr-20 cursor-pointer font-mono"
          onClick={() => intervalModalRef.current?.open()}
        />
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-gray-100 rounded-full h-8 w-8 p-2"
            onClick={handleClear}
          >
            <X className="h-4 w-4 text-gray-500" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-gray-100 rounded-full h-8 w-8 p-2"
            onClick={() => intervalModalRef.current?.open()}
          >
            <Clock className="h-4 w-4 text-gray-500" />
          </Button>
        </div>
      </div>
      
      <IntervalModalComponent
        ref={intervalModalRef}
        onSave={handleIntervalSave}
        onStateChange={() => {}}
        initialState={currentState}
      />
    </div>
  );
};

export default SchedulePicker;