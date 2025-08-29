import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import {Save} from "lucide-react"

const intervals = ["minutes", "hourly", "daily", "weekly", "monthly", "yearly"];
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export interface IntervalModalRef {
  open: () => void;
}

export interface IntervalState {
  selectedInterval: string;
  repeatEvery: string;
  repeatAt: string;
  selectedDays: string[];
  selectedMonth: string;
  selectedDate: string;
}

interface IntervalModalProps {
  onSave: (interval: string) => void;
  onStateChange: (state: IntervalState) => void;
  initialState: IntervalState;
}

export const IntervalModal = forwardRef<IntervalModalRef, IntervalModalProps>(
  ({ onSave, onStateChange, initialState }, ref) => {
    const [open, setOpen] = useState(false);
    const [state, setState] = useState<IntervalState>(initialState);

    useEffect(() => {
      if (open) {
        setState(initialState);
      }
    }, [open, initialState]);

    useEffect(() => {
      onStateChange(state);
    }, [state, onStateChange]);

    const updateState = (newState: Partial<IntervalState>) => {
      setState(prevState => ({ ...prevState, ...newState }));
    };

    const handleSave = () => {
      onSave(JSON.stringify(state));
      setOpen(false);
    };

    useImperativeHandle(ref, () => ({
      open: () => setOpen(true),
    }));

    const renderIntervalContent = () => {
      const intervalType = state.selectedInterval.toLowerCase();
      
      switch (intervalType) {
        case "minutes":
          return (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={state.repeatEvery}
                onChange={(e) => updateState({ repeatEvery: e.target.value })}
                className="w-20"
                min="1"
                max="59"
              />
              <span>Minutes</span>
            </div>
          );

        case "hourly":
          return (
            <div className="flex gap-4">
              <div className="flex flex-col">
                <span className="mb-2">Hours</span>
                <Input
                  type="number"
                  value={state.repeatEvery}
                  onChange={(e) => updateState({ repeatEvery: e.target.value })}
                  className="w-20"
                  min="1"
                  max="23"
                />
              </div>
              <div className="flex flex-col">
                <span className="mb-2">Time(UTC)</span>
                <Input
                  type="time"
                  value={state.repeatAt}
                  onChange={(e) => updateState({ repeatAt: e.target.value })}
                  className="w-32"
                />
              </div>
            </div>
          );

        case "daily":
          return (
            <div className="flex items-center gap-2">
              <span>Repeat At</span>
              <Input
                type="time"
                value={state.repeatAt}
                onChange={(e) => updateState({ repeatAt: e.target.value })}
                className="w-32"
              />
            </div>
          );

        case "weekly":
          return (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="flex items-center space-x-2 border rounded p-2">
                    <Checkbox
                      id={day}
                      checked={state.selectedDays.includes(day)}
                      onCheckedChange={(checked) => {
                        updateState({
                          selectedDays: checked
                            ? [...state.selectedDays, day]
                            : state.selectedDays.filter((d) => d !== day)
                        });
                      }}
                    />
                    <label htmlFor={day} className="text-sm cursor-pointer">
                      {day}
                    </label>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span>Repeat At</span>
                <Input
                  type="time"
                  value={state.repeatAt}
                  onChange={(e) => updateState({ repeatAt: e.target.value })}
                  className="w-32"
                />
              </div>
            </div>
          );

        case "monthly":
          return (
            <div className="flex gap-4">
              <div className="flex flex-col">
                <span className="mb-2">Repeat On Day</span>
                <Select
                  value={state.selectedDate}
                  onValueChange={(value) => updateState({ selectedDate: value })}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 31 }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col">
                <span className="mb-2">Repeat At</span>
                <Input
                  type="time"
                  value={state.repeatAt}
                  onChange={(e) => updateState({ repeatAt: e.target.value })}
                  className="w-32"
                />
              </div>
            </div>
          );

        case "yearly":
          return (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="mb-2">Month</span>
                  <Select
                    value={state.selectedMonth}
                    onValueChange={(value) => updateState({ selectedMonth: value })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month} value={month}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col">
                  <span className="mb-2">Day</span>
                  <Select
                    value={state.selectedDate}
                    onValueChange={(value) => updateState({ selectedDate: value })}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 31 }, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span>Repeat At</span>
                <Input
                  type="time"
                  value={state.repeatAt}
                  onChange={(e) => updateState({ repeatAt: e.target.value })}
                  className="w-32"
                />
              </div>
            </div>
          );

        default:
          return null;
      }
    };

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Schedule Interval</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="flex flex-wrap gap-2 mb-4">
              {intervals.map((interval) => (
                <Button
                  key={interval}
                  variant={state.selectedInterval.toLowerCase() === interval.toLowerCase() ? "outline" : "ghost"}
                  onClick={() => updateState({ selectedInterval: interval })}
                  className="flex-1 px-2 py-1 text-sm"
                >
                  {interval.charAt(0).toUpperCase() + interval.slice(1)}
                </Button>
              ))}
            </div>
            <div className="space-y-4 pr-4">
              {renderIntervalContent()}
            </div>
          </ScrollArea>
          <DialogFooter className="flex justify-end px-2 pb-2">
            <Button 
              variant="outline" 
              onClick={handleSave} 
              className="bg-black hover:bg-gray-800 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 shadow-sm"
            >
              <Save className="h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
);

IntervalModal.displayName = "IntervalModal";
