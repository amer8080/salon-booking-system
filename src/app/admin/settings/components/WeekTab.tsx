// src/app/admin/settings/components/WeekTab.tsx
import { Calendar } from 'lucide-react';
import { WeekSettings } from '@/types/theme.types';

interface WeekTabProps {
  tempWeekSettings: WeekSettings;
  setTempWeekSettings: (settings: WeekSettings) => void;
}

export default function WeekTab({ tempWeekSettings, setTempWeekSettings }: WeekTabProps) {
  return (
    <div>
      <div className="flex items-center mb-6">
        <Calendar className="w-8 h-8 text-green-600 ml-3" />
        <div>
          <h2 className="text-2xl font-bold text-gray-800">إعدادات الأسبوع</h2>
          <p className="text-gray-600 mt-1">اختر اليوم الأول في الأسبوع لعرض التقويم</p>
        </div>
      </div>

      {/* اختيار أول يوم في الأسبوع */}
      <div className="space-y-4">
        <label className="block text-lg font-medium text-gray-700">أول يوم في الأسبوع</label>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { value: 0, label: 'الأحد', emoji: '🌅', desc: 'النظام الأمريكي/العربي' },
            { value: 1, label: 'الإثنين', emoji: '🌍', desc: 'النظام الأوروبي/الدولي' },
            { value: 6, label: 'السبت', emoji: '🕌', desc: 'النظام الإسلامي التقليدي' },
          ].map((option) => (
            <div
              key={option.value}
              onClick={() => setTempWeekSettings({
                ...tempWeekSettings,
                firstDayOfWeek: option.value as 0 | 1 | 6
              })}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                tempWeekSettings.firstDayOfWeek === option.value
                  ? 'border-green-500 bg-green-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">{option.emoji}</div>
                <h3 className="font-semibold text-gray-800">{option.label}</h3>
                <p className="text-sm text-gray-600 mt-1">{option.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}