const fs = require('fs');

let code = fs.readFileSync('src/screens/main/CreateCampaignScreen.jsx', 'utf8');

// 1. Add DateTimePicker import
code = code.replace(
  `import * as ImagePicker from 'expo-image-picker';`,
  `import * as ImagePicker from 'expo-image-picker';\nimport DateTimePicker from '@react-native-community/datetimepicker';\nimport { Clock } from 'lucide-react-native';`
);

// 2. Add lucide icon if missing (we added Clock above)
if (!code.includes('import { Clock }')) {
    code = code.replace(
        `import { ArrowLeft`,
        `import { ArrowLeft, Clock`
    );
}

// 3. Remove start/end date/time from form state
code = code.replace(
  `    startDate: formatDateString(new Date()),\n    endDate: formatDateString(new Date(Date.now() + 3 * 86400000)), \n    startTime: '10:00',\n    endTime: '22:00',`,
  ``
);

// 4. Inject state variables and formatting functions
const stateInjection = `
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

  const [showPicker, setShowPicker] = useState({
    startDate: false,
    endDate: false,
    startTime: false,
    endTime: false,
  });

  function openPicker(key) {
    setShowPicker({
      startDate: false,
      endDate: false,
      startTime: false,
      endTime: false,
      [key]: true,
    });
  }

  function closePicker() {
    setShowPicker({
      startDate: false,
      endDate: false,
      startTime: false,
      endTime: false,
    });
  }

  function formatDate(date) {
    if (!date) return 'Select date';
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  function formatTime(date) {
    if (!date) return 'Select time';
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }
`;
code = code.replace(`  const [step, setStep] = useState(1);`, stateInjection + `\n  const [step, setStep] = useState(1);`);


// 5. Update useMemo computations
const scheduledDaysRegex = /const scheduledDays = useMemo\(\(\) => \{[\s\S]*?\}, \[form\.startDate, form\.endDate\]\);/;
code = code.replace(scheduledDaysRegex, `
  const scheduledDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    const diff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 ? diff + 1 : 0;
  }, [startDate, endDate]);
`);

const dailySlotRegex = /const dailySlotSeconds = useMemo\(\(\) => \{[\s\S]*?\}, \[form\.startTime, form\.endTime\]\);/;
code = code.replace(dailySlotRegex, `
  const dailySlotSeconds = useMemo(() => {
    if (!startTime || !endTime) return 0;
    const startSeconds = startTime.getHours() * 3600 + startTime.getMinutes() * 60;
    const endSeconds = endTime.getHours() * 3600 + endTime.getMinutes() * 60;
    if (endSeconds <= startSeconds) return 0;
    return endSeconds - startSeconds;
  }, [startTime, endTime]);
`);


// 6. Update handleNext validation logic for dates
const nextRegex = /if \(step === 3\) \{[\s\S]*?return Alert.alert\('Invalid Time', 'End time must be after start time.'\);\n      \}/;
code = code.replace(nextRegex, `if (step === 3) {
      if (!startDate || !endDate || !startTime || !endTime) return Alert.alert('Required', 'Please select both date and time ranges.');
      if (endDate < startDate) return Alert.alert('Invalid Date', 'End date cannot be before start date.');
      
      const startSeconds = startTime.getHours() * 3600 + startTime.getMinutes() * 60;
      const endSeconds = endTime.getHours() * 3600 + endTime.getMinutes() * 60;
      if (endSeconds <= startSeconds) return Alert.alert('Invalid Time', 'End time must be after start time.');
    }`);


// 7. Update handleLaunch API payload
code = code.replace(
  `        start_date: form.startDate,
        end_date: form.endDate,
        start_time: form.startTime,
        end_time: form.endTime,`,
  `        start_date: startDate ? formatDateString(startDate) : null,
        end_date: endDate ? formatDateString(endDate) : null,
        start_time: startTime ? \`\${String(startTime.getHours()).padStart(2, '0')}:\${String(startTime.getMinutes()).padStart(2, '0')}\` : null,
        end_time: endTime ? \`\${String(endTime.getHours()).padStart(2, '0')}:\${String(endTime.getMinutes()).padStart(2, '0')}\` : null,`
);

// 8. Fix old UI bindings in Review and Success steps
// Review Step 4
code = code.replace(
  `              <Text className="text-slate-900 dark:text-white font-bold mb-1">{form.startDate} to {form.endDate} ({safeScheduledDays} days)</Text>`,
  `              <Text className="text-slate-900 dark:text-white font-bold mb-1">{formatDate(startDate)} to {formatDate(endDate)} ({safeScheduledDays} days)</Text>`
);

code = code.replace(
  `              <Text className="text-slate-900 dark:text-white font-bold mb-4">{form.startTime} to {form.endTime}</Text>`,
  `              <Text className="text-slate-900 dark:text-white font-bold mb-4">{formatTime(startTime)} to {formatTime(endTime)}</Text>`
);

// Success Step 6
code = code.replace(
  `              <Text className="text-slate-900 font-bold">{form.startDate} to {form.endDate}</Text>`,
  `              <Text className="text-slate-900 font-bold">{formatDate(startDate)} to {formatDate(endDate)}</Text>`
);


// 9. Overwrite Step 3 Schedule UI
const step3Regex = /\{\/\* STEP 3: SCHEDULE \*\/\}\s*\{step === 3 && \([\s\S]*?<\/[Vv]iew>\s*\)\}/;
const newStep3 = `{/* STEP 3: SCHEDULE */}
        {step === 3 && (
          <View>
            <Text className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">WHEN SHOULD YOUR AD PLAY?</Text>
            <Text className="text-slate-500 dark:text-[#8B949E] mb-6">Select the scheduling range for displaying your advertisement.</Text>

            <View className="flex-row justify-between mb-2 px-1">
              <Text className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex-1">Start Date</Text>
              <Text className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex-1 ml-4">End Date</Text>
            </View>
            
            <View className="flex-row justify-between mb-6">
              <TouchableOpacity 
                onPress={() => openPicker('startDate')}
                className="flex-row items-center bg-white dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] rounded-xl p-3 flex-1 shadow-sm"
              >
                <Calendar size={18} className="text-slate-400 mr-2" />
                <Text className="text-slate-900 dark:text-white font-bold">{formatDate(startDate)}</Text>
              </TouchableOpacity>
              
              <View className="w-4" />
              
              <TouchableOpacity 
                onPress={() => openPicker('endDate')}
                className="flex-row items-center bg-white dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] rounded-xl p-3 flex-1 shadow-sm"
              >
                <Calendar size={18} className="text-slate-400 mr-2" />
                <Text className="text-slate-900 dark:text-white font-bold">{formatDate(endDate)}</Text>
              </TouchableOpacity>
            </View>

            <Text className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">Daily Time Slot</Text>
            <View className="flex-row justify-between items-center mb-6">
              <TouchableOpacity 
                onPress={() => openPicker('startTime')}
                className="flex-row items-center bg-white dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] rounded-xl p-3 flex-1 shadow-sm"
              >
                <Clock size={18} className="text-slate-400 mr-2" />
                <Text className="text-slate-900 dark:text-white font-bold">{formatTime(startTime)}</Text>
              </TouchableOpacity>
              
              <Text className="text-slate-400 mx-3 font-bold">→</Text>
              
              <TouchableOpacity 
                onPress={() => openPicker('endTime')}
                className="flex-row items-center bg-white dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] rounded-xl p-3 flex-1 shadow-sm"
              >
                <Clock size={18} className="text-slate-400 mr-2" />
                <Text className="text-slate-900 dark:text-white font-bold">{formatTime(endTime)}</Text>
              </TouchableOpacity>
            </View>

            {(startDate && endDate && startTime && endTime) && (
              <View className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-2xl p-5 mb-4">
                <Text className="text-xs font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-4">Your Ad Schedule</Text>
                
                <View className="flex-row items-center mb-3">
                  <Calendar size={16} className="text-amber-500 mr-3" />
                  <Text className="text-amber-800 dark:text-amber-100 font-bold">
                    {formatDate(startDate)} → {formatDate(endDate)}
                  </Text>
                </View>
                
                <View className="flex-row items-center mb-3">
                  <Clock size={16} className="text-amber-500 mr-3" />
                  <Text className="text-amber-800 dark:text-amber-100 font-bold">
                    Every day, {formatTime(startTime)} → {formatTime(endTime)}
                  </Text>
                </View>
                
                <View className="flex-row items-center">
                  <CheckCircle2 size={16} className="text-amber-500 mr-3" />
                  <Text className="text-amber-800 dark:text-amber-100 font-bold">
                    {safeScheduledDays} days · {Math.floor(dailySlotSeconds / 3600)} hr {Math.floor((dailySlotSeconds % 3600) / 60)} min/day
                  </Text>
                </View>
              </View>
            )}

            {/* Render Native Pickers */}
            {showPicker.startDate && (
              <DateTimePicker
                value={startDate || new Date()}
                mode="date"
                display="default"
                minimumDate={new Date()}
                onChange={(event, selected) => {
                  closePicker();
                  if (event.type === 'dismissed') return;
                  if (selected) {
                    setStartDate(selected);
                    if (endDate && selected > endDate) setEndDate(selected);
                  }
                }}
              />
            )}
            
            {showPicker.endDate && (
              <DateTimePicker
                value={endDate || startDate || new Date()}
                mode="date"
                display="default"
                minimumDate={startDate || new Date()}
                onChange={(event, selected) => {
                  closePicker();
                  if (event.type === 'dismissed') return;
                  if (selected) setEndDate(selected);
                }}
              />
            )}
            
            {showPicker.startTime && (
              <DateTimePicker
                value={startTime || new Date()}
                mode="time"
                display="default"
                is24Hour={false}
                onChange={(event, selected) => {
                  closePicker();
                  if (event.type === 'dismissed') return;
                  if (selected) setStartTime(selected);
                }}
              />
            )}
            
            {showPicker.endTime && (
              <DateTimePicker
                value={endTime || new Date()}
                mode="time"
                display="default"
                is24Hour={false}
                onChange={(event, selected) => {
                  closePicker();
                  if (event.type === 'dismissed') return;
                  if (selected) setEndTime(selected);
                }}
              />
            )}
          </View>
        )}`;
        
code = code.replace(step3Regex, newStep3);

// Remove the old openCalendar modal block entirely from JSX
const calendarModalRegex = /\{\/\* CALENDAR MODAL \*\/\}\s*<Modal[\s\S]*?<\/Modal>/;
code = code.replace(calendarModalRegex, '');

// Remove related state variables for the custom calendar modal if they exist
code = code.replace(/const \[showCalendar, setShowCalendar\] = useState\(false\);\n/, '');
code = code.replace(/const \[calendarMode, setCalendarMode\] = useState\('start'\);\n/, '');
code = code.replace(/const \[currentMonth, setCurrentMonth\] = useState\(new Date\(\)\);\n/, '');

// Remove custom calendar functions
code = code.replace(/  const openCalendar = \(mode\) => \{[\s\S]*?\};\n/, '');
code = code.replace(/  const changeMonth = \(delta\) => \{[\s\S]*?\};\n/, '');
code = code.replace(/  const handleCalendarDayPress = \(day\) => \{[\s\S]*?\};\n/, '');
code = code.replace(/  const getDaysInMonth = \(year, month\) => \{[\s\S]*?\};\n/, '');

fs.writeFileSync('src/screens/main/CreateCampaignScreen.jsx', code);
console.log('Script executed on actual file');
