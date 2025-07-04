// src/app/admin/settings/components/BusinessTab.tsx
import { Clock, Globe, Users } from 'lucide-react';
import { 
  BusinessSettings, 
  TIMEZONE_OPTIONS, 
  SLOT_DURATION_OPTIONS, 
  DAY_LABELS 
} from '@/types/theme.types';

interface BusinessTabProps {
  tempBusinessSettings: BusinessSettings;
  setTempBusinessSettings: (settings: BusinessSettings) => void;
}

export default function BusinessTab({ tempBusinessSettings, setTempBusinessSettings }: BusinessTabProps) {
  return (
    <div>
      <div className="flex items-center mb-6">
        <Clock className="w-8 h-8 text-blue-600 ml-3" />
        <div>
          <h2 className="text-2xl font-bold text-gray-800">إعدادات العمل</h2>
          <p className="text-gray-600 mt-1">تحديد ساعات العمل والمواعيد والمنطقة الزمنية</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* المنطقة الزمنية */}
        <div className="space-y-4">
          <label className="block text-lg font-medium text-gray-700">
            <Globe className="w-5 h-5 inline ml-2" />
            المنطقة الزمنية
          </label>
          <select
            value={tempBusinessSettings.timezone}
            onChange={(e) => setTempBusinessSettings({
              ...tempBusinessSettings,
              timezone: e.target.value
            })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          >
            {TIMEZONE_OPTIONS.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
        </div>

        {/* مدة الموعد */}
        <div className="space-y-4">
          <label className="block text-lg font-medium text-gray-700">
            مدة الموعد الافتراضي
          </label>
          <select
            value={tempBusinessSettings.slotDuration}
            onChange={(e) => setTempBusinessSettings({
              ...tempBusinessSettings,
              slotDuration: parseInt(e.target.value)
            })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          >
            {SLOT_DURATION_OPTIONS.map((duration) => (
              <option key={duration.value} value={duration.value}>
                {duration.label}
              </option>
            ))}
          </select>
        </div>

        {/* ساعات العمل */}
        <div className="space-y-4">
          <label className="block text-lg font-medium text-gray-700">
            ساعات العمل
          </label>
          <div className="flex space-x-4 rtl:space-x-reverse">
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">من</label>
              <input
                type="time"
                value={tempBusinessSettings.businessHours.start}
                onChange={(e) => setTempBusinessSettings({
                  ...tempBusinessSettings,
                  businessHours: {
                    ...tempBusinessSettings.businessHours,
                    start: e.target.value
                  }
                })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">إلى</label>
              <input
                type="time"
                value={tempBusinessSettings.businessHours.end}
                onChange={(e) => setTempBusinessSettings({
                  ...tempBusinessSettings,
                  businessHours: {
                    ...tempBusinessSettings.businessHours,
                    end: e.target.value
                  }
                })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* الفترة بين المواعيد */}
        <div className="space-y-4">
          <label className="block text-lg font-medium text-gray-700">
            الحد الأدنى بين المواعيد (دقيقة)
          </label>
          <input
            type="number"
            min="0"
            max="60"
            value={tempBusinessSettings.minBookingGap}
            onChange={(e) => setTempBusinessSettings({
              ...tempBusinessSettings,
              minBookingGap: parseInt(e.target.value) || 0
            })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* أيام العمل */}
      <div className="space-y-4 mt-8">
        <label className="block text-lg font-medium text-gray-700">
          <Users className="w-5 h-5 inline ml-2" />
          أيام العمل
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {Object.entries(DAY_LABELS).map(([dayValue, dayLabel]) => {
            const dayNum = parseInt(dayValue);
            const isSelected = tempBusinessSettings.workingDays.includes(dayNum);
            
            return (
              <button
                key={dayNum}
                type="button"
                onClick={() => {
                  const newWorkingDays = isSelected
                    ? tempBusinessSettings.workingDays.filter(d => d !== dayNum)
                    : [...tempBusinessSettings.workingDays, dayNum].sort();
                  
                  setTempBusinessSettings({
                    ...tempBusinessSettings,
                    workingDays: newWorkingDays
                  });
                }}
                className={`p-3 text-sm font-medium rounded-lg border-2 transition-all duration-200 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                {dayLabel}
              </button>
            );
          })}
        </div>
        <p className="text-sm text-gray-500">اختر الأيام التي يعمل فيها الصالون</p>
      </div>
    </div>
  );
}