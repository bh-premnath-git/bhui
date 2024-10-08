import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"

const intervals = ["Minutes", "Hourly", "Daily", "Weekly", "Monthly", "Yearly"]
const months = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
]

export interface IntervalModalRef {
  open: () => void;
}

interface IntervalModalProps {
  onSave: (interval: string) => void;
  onStateChange: (state: IntervalState) => void;
}

interface IntervalState {
  selectedInterval: string;
  repeatEvery: string;
  repeatAt: string;
  selectedDays: string[];
  selectedMonth: string;
  selectedDate: string;
}

export const IntervalModalComponent = forwardRef<IntervalModalRef, IntervalModalProps>(
  ({ onSave, onStateChange }, ref) => {
  const [open, setOpen] = useState(false)
  const [state, setState] = useState<IntervalState>({
    selectedInterval: "Monthly",
    repeatEvery: "1",
    repeatAt: "12:00",
    selectedDays: ["Sun"],
    selectedMonth: "September",
    selectedDate: "5"
  })

  useEffect(() => {
    onStateChange(state);
  }, [state, onStateChange]);

  const updateState = (newState: Partial<IntervalState>) => {
    setState(prevState => ({ ...prevState, ...newState }));
  };

  const handleSave = () => {
    onSave(JSON.stringify(state));
    setOpen(false)
  }

  useImperativeHandle(ref, () => ({
    open: () => setOpen(true),
  }));

  const renderIntervalContent = () => {
    switch (state.selectedInterval) {
      case "Minutes":
        return (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={state.repeatEvery}
              onChange={(e) => updateState({ repeatEvery: e.target.value })}
              className="w-20"
            />
            <span>Minutes</span>
          </div>
        )
      case "Hourly":
        return (
          <div className="flex gap-4">
            <div className="flex flex-col">
              <span className="mb-2">Hours</span>
              <Input
                type="number"
                value={state.repeatEvery}
                onChange={(e) => updateState({ repeatEvery: e.target.value })}
                className="w-20"
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
        )
      case "Daily":
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
        )
      case "Weekly":
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="flex items-center">
                  <Checkbox
                    id={day}
                    checked={state.selectedDays.includes(day)}
                    onCheckedChange={(checked) => {
                      updateState({
                        selectedDays: checked
                          ? [...state.selectedDays, day]
                          : state.selectedDays.filter((d) => d !== day)
                      })
                    }}
                  />
                  <label htmlFor={day} className="ml-1 text-sm">
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
        )
      case "Monthly":
        return (
          <div className="flex gap-4">
            <div className="flex flex-col">
              <span className="mb-2">Repeat On</span>
              <Select 
                value={state.selectedDate} 
                onValueChange={(value) => updateState({ selectedDate: value })}
              >
                <SelectTrigger className="w-20">
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
        )
      case "Yearly":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span>Repeat</span>
              <Select 
                value={state.repeatEvery} 
                onValueChange={(value) => updateState({ repeatEvery: value })}
              >
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="Every" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      Every {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Select 
                value={state.selectedDate} 
                onValueChange={(value) => updateState({ selectedDate: value })}
              >
                <SelectTrigger className="w-20">
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
        )
      default:
        return null
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Schedule Interval</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="flex gap-1 mb-4">
              {intervals.map((interval) => (
                <Button
                  key={interval}
                  variant={state.selectedInterval === interval ? "sky" : "outline"}
                  onClick={() => updateState({ selectedInterval: interval })}
                  className="flex-1 px-2 py-1 text-sm"
                >
                  {interval}
                </Button>
              ))}
            </div>
            <div className="space-y-4 pr-4">
              {renderIntervalContent()}
            </div>
          </ScrollArea>
          <DialogFooter className="sm:justify-center">
            <div className="flex justify-center space-x-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Close
              </Button>
              <Button className="bg-slate-400" onClick={handleSave}>Save</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
})