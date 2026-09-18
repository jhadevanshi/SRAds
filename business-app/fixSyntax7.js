const fs = require('fs');

let code = fs.readFileSync('src/screens/main/CreateCampaignScreen.jsx', 'utf8');

const targetLine = '                          <Text className="text-amber-700 dark:text-amber-500 font-bold text-xs">Final Duration: {parseInt(form.trimEnd) - parseInt(form.trimStart) || 0}s</Text>\\n                        </View>\\n                      </View>\\n        )}';

const fix = '                          <Text className="text-amber-700 dark:text-amber-500 font-bold text-xs">Final Duration: {parseInt(form.trimEnd) - parseInt(form.trimStart) || 0}s</Text>\\n                        </View>\\n                      </View>\\n                    )}\\n                  </View>\\n                )}';

// It might be formatted differently, so let's do this:
let lines = code.split('\\n');
let i = 0;
while (i < lines.length) {
  if (lines[i].includes('Final Duration:')) {
    // The next few lines are:
    // </View>
    // </View>
    // )}
    if (lines[i+3].includes(')}')) {
      lines[i+3] = '                    )}\\n                  </View>\\n                )}';
      break;
    }
  }
  i++;
}

fs.writeFileSync('src/screens/main/CreateCampaignScreen.jsx', lines.join('\\n'));
console.log('Fixed missing tags');
