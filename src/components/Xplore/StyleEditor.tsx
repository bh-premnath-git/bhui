import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useChartStyles } from "@/hooks/useChartStyles";

export default function StyleEditor() {
  const { styles, setStyles } = useChartStyles();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Chart Height</Label>
        <Slider 
          defaultValue={[styles.height]} 
          max={600} 
          min={200} 
          step={10} 
          onValueChange={(value) => setStyles({ height: value[0] })}
        />
      </div>
      
      <div className="space-y-2">
        <Label>Color Scheme</Label>
        <Select 
          value={styles.colorScheme}
          onValueChange={(value: 'default' | 'monochrome' | 'colorful') => 
            setStyles({ colorScheme: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select color scheme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="monochrome">Monochrome</SelectItem>
            <SelectItem value="colorful">Colorful</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}