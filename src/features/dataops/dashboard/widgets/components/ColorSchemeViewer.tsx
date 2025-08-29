import {
  COLOR_SCHEME_ORDER,
  ColorScheme,
} from '@/store/slices/dataops/dashboardSlice';
import { Button } from '@/components/ui/button';

interface ColorSchemeViewerProps {
  selected: ColorScheme;
  onChange: (scheme: ColorScheme, customPalette?: string[]) => void;
  onApply?: () => void;
}

export const ColorSchemeViewer = ({
  selected,
  onChange,
  onApply,
}: ColorSchemeViewerProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {COLOR_SCHEME_ORDER.map((scheme) => (
        <Button
          key={scheme}
          variant={scheme === selected ? 'default' : 'outline'}
          className="text-xs capitalize"
          onClick={() => onChange(scheme)}
        >
          {scheme}
        </Button>
      ))}

      {onApply && (
        <div className="col-span-full flex justify-end mt-3">
          <Button size="sm" onClick={onApply}>
            Apply Color Scheme
          </Button>
        </div>
      )}
    </div>
  );
};
