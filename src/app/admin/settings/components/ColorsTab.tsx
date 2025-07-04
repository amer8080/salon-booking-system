// src/app/admin/settings/components/ColorsTab.tsx
import { ColorPicker } from 'antd';
import { Palette } from 'lucide-react';
import { BookingColors, COLOR_LABELS } from '@/types/theme.types';

interface ColorsTabProps {
  tempColors: BookingColors;
  setTempColors: (colors: BookingColors) => void;
}

export default function ColorsTab({ tempColors, setTempColors }: ColorsTabProps) {
  const handleColorPreview = (colorKey: keyof BookingColors, value: string) => {
    const newTempColors = { ...tempColors, [colorKey]: value };
    setTempColors(newTempColors);

    // تطبيق مؤقت للمعاينة
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.style.setProperty(`--booking-color-${colorKey}`, value);
    }
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <Palette className="w-8 h-8 text-purple-600 ml-3" />
        <div>
          <h2 className="text-2xl font-bold text-gray-800">تخصيص ألوان الحجوزات</h2>
          <p className="text-gray-600 mt-1">اختر الألوان المناسبة لحالات الحجوزات المختلفة</p>
        </div>
      </div>

      {/* شبكة منتقيات الألوان */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {(Object.keys(tempColors) as Array<keyof BookingColors>).map((colorKey) => (
          <div key={colorKey} className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              {COLOR_LABELS[colorKey]}
            </label>
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <ColorPicker
                value={tempColors[colorKey]}
                onChange={(color) => handleColorPreview(colorKey, color.toHexString())}
                showText
                size="large"
              />
              <div
                className="w-16 h-12 rounded-lg border-2 border-gray-200"
                style={{ backgroundColor: tempColors[colorKey] }}
                title="معاينة اللون"
              />
              <span className="text-sm text-gray-600 font-mono">{tempColors[colorKey]}</span>
            </div>
          </div>
        ))}
      </div>

      {/* معاينة الألوان */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">معاينة الألوان</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(Object.keys(tempColors) as Array<keyof BookingColors>).map((colorKey) => (
            <div key={colorKey} className="text-center">
              <div
                className="w-full h-20 rounded-lg mb-2 border-2 border-gray-200 flex items-center justify-center text-white font-semibold"
                style={{ backgroundColor: tempColors[colorKey] }}
              >
                {COLOR_LABELS[colorKey].split(' ')[0]}
              </div>
              <span className="text-sm text-gray-600">{COLOR_LABELS[colorKey]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}