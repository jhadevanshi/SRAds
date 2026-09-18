const fs = require('fs');

let code = fs.readFileSync('src/screens/main/CreateCampaignScreen.jsx', 'utf8');

const startIdx = code.indexOf('    if (step === 3) {');
const endIdx = code.indexOf('    if (step === 4) {');

const newNext = "    if (step === 3) {\n" +
"      if (!startDate || !endDate || !startTime || !endTime) return Alert.alert('Required', 'Please select both date and time ranges.');\n" +
"      \n" +
"      const sd = new Date(startDate);\n" +
"      const ed = new Date(endDate);\n" +
"      sd.setHours(0, 0, 0, 0);\n" +
"      ed.setHours(0, 0, 0, 0);\n" +
"      \n" +
"      if (ed < sd) return Alert.alert('Invalid Date', 'End date cannot be before start date.');\n" +
"      \n" +
"      const startSeconds = startTime.getHours() * 3600 + startTime.getMinutes() * 60;\n" +
"      const endSeconds = endTime.getHours() * 3600 + endTime.getMinutes() * 60;\n" +
"      if (endSeconds <= startSeconds) return Alert.alert('Invalid Time', 'End time must be after start time.');\n" +
"    }\n";

code = code.substring(0, startIdx) + newNext + code.substring(endIdx);

fs.writeFileSync('src/screens/main/CreateCampaignScreen.jsx', code);
console.log('Fixed handleNext');
