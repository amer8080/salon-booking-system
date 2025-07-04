// src/app/admin/settings/components/AdvancedTab.tsx
import { Coffee } from 'lucide-react';
import { LunchBreakSettings } from '@/types/theme.types';

interface AdvancedTabProps {
  tempLunchBreakSettings: LunchBreakSettings;
  setTempLunchBreakSettings: (settings: LunchBreakSettings) => void;
}

export default function AdvancedTab({ tempLunchBreakSettings, setTempLunchBreakSettings }: AdvancedTabProps) {
  return (
    <div>
      <div className="flex items-center mb-6">
        <Coffee className="w-8 h-8 text-orange-600 ml-3" />
        <div>
          <h2 className="text-2xl font-bold text-gray-800">الإعدادات المتقدمة</h2>
          <p className="text-gray-600 mt-1">إعدادات استراحة الغداء والخيارات الإضافية</p>
        </div>
      </div>

      {/* استراحة الغداء */}
      <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Coffee className="w-6 h-6 text-orange-600 ml-2" />
            <h3 className="text-xl font-semibold text-gray-800">استراحة الغداء</h3>
          </div>
          
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={tempLunchBreakSettings.enabled}
              onChange={(e) => setTempLunchBreakSettings({
                ...tempLunchBreakSettings,
                enabled: e.target.checked
              })}
              className="sr-only"
            />
            <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              tempLunchBreakSettings.enabled ? 'bg-orange-600' : 'bg-gray-200'
            }`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                tempLunchBreakSettings.enabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </div>
            <span className="ml-3 text-sm font-medium text-gray-700">
              {tempLunchBreakSettings.enabled ? 'مفعل' : 'معطل'}
            </span>
          </label>
        </div>

        {tempLunchBreakSettings.enabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                بداية الاستراحة
              </label>
              <input
                type="time"
                value={tempLunchBreakSettings.start}
                onChange={(e) => setTempLunchBreakSettings({
                  ...tempLunchBreakSettings,
                  start: e.target.value
                })}
                className="w-full p-3 border border-orange-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نهاية الاستراحة
              </label>
              <input
                type="time"
                value={tempLunchBreakSettings.end}
                onChange={(e) => setTempLunchBreakSettings({
                  ...tempLunchBreakSettings,
                  end: e.target.value
                })}
                className="w-full p-3 border border-orange-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
        )}

        <div className="mt-4 p-4 bg-orange-100 rounded-lg">
          <p className="text-sm text-orange-800">
            <strong>ملاحظة:</strong> عند تفعيل استراحة الغداء، لن تكون هناك مواعيد متاحة خلال هذه الفترة.
          </p>
        </div>
      </div>
    </div>
  );
}