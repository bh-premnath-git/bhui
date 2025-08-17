import { CHART_TYPE_ORDER, ChartType } from '@/store/slices/dataops/dashboardSlice';
import { Button } from '@/components/ui/button';

interface ChartTypeViewerProps {
  selected: ChartType;
  onChange: (type: ChartType) => void;
  onApply?: () => void;
}

export const ChartTypeViewer = ({ selected, onChange, onApply }: ChartTypeViewerProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {CHART_TYPE_ORDER.map((t) => (
        <Button
          key={t}
          variant={t === selected ? 'default' : 'outline'}
          className="text-xs capitalize"
          onClick={() => onChange(t)}
        >
          {t}
        </Button>
      ))}
      {onApply && (
        <div className="col-span-full flex justify-end mt-3">
          <Button size="sm" onClick={onApply}>
            Apply Chart Type
          </Button>
        </div>
      )}
    </div>
  );
};
