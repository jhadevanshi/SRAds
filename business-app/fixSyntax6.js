const fs = require('fs');
let code = fs.readFileSync('src/screens/main/CreateCampaignScreen.jsx', 'utf8');

const badBlock = \`                        <View className="mt-3 bg-amber-50 dark:bg-amber-900/20 py-2 rounded-lg items-center border border-amber-200 dark:border-amber-700/50">
                          <Text className="text-amber-700 dark:text-amber-500 font-bold text-xs">Final Duration: {parseInt(form.trimEnd) - parseInt(form.trimStart) || 0}s</Text>
                        </View>
                      </View>
        )}\`;

const goodBlock = \`                        <View className="mt-3 bg-amber-50 dark:bg-amber-900/20 py-2 rounded-lg items-center border border-amber-200 dark:border-amber-700/50">
                          <Text className="text-amber-700 dark:text-amber-500 font-bold text-xs">Final Duration: {parseInt(form.trimEnd) - parseInt(form.trimStart) || 0}s</Text>
                        </View>
                      </View>
                    )}
                  </View>
                )}\`;

code = code.replace(badBlock, goodBlock);
fs.writeFileSync('src/screens/main/CreateCampaignScreen.jsx', code);
console.log('Fixed syntax error inside upload mode');
