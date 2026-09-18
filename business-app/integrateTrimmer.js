const fs = require('fs');
let code = fs.readFileSync('src/screens/main/CreateCampaignScreen.jsx', 'utf8');

// 1. Add VideoTrimmer import
const importTarget = "import { businessService } from '../../services/business';";
if (!code.includes('VideoTrimmer')) {
    code = code.replace(importTarget, importTarget + "\nimport VideoTrimmer from '../../components/VideoTrimmer';");
}

// 2. Add videoTrimmerVisible state
const stateTarget = "const [uploading, setUploading] = useState(false);";
if (!code.includes('videoTrimmerVisible')) {
    code = code.replace(stateTarget, stateTarget + "\n  const [videoTrimmerVisible, setVideoTrimmerVisible] = useState(false);");
}

// 3. Update pickMedia function
const oldPickMedia = `const pickMedia = async (mediaType) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: mediaType === 'video' ? ImagePicker.MediaTypeOptions.Videos : ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      if (asset.type === 'video') {
        const durationSec = Math.floor((asset.duration || 0) / 1000);
        if (durationSec > 60) {
          Alert.alert('Invalid Video', 'Video duration must be 60 seconds or less.');
          return;
        }
        setForm(prev => ({ ...prev, trimEnd: String(Math.floor(durationSec)) }));
      }
      setNewAdMedia(asset);
    }
  };`;

const newPickMedia = `const pickMedia = async (mediaType) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: mediaType === 'video' ? ImagePicker.MediaTypeOptions.Videos : ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false, // Turn off native trimmer so we use our custom visual trimmer
      quality: 1,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      if (asset.type === 'video') {
        const durationSec = Math.floor((asset.duration || 0) / 1000);
        if (durationSec > 60) {
          Alert.alert('Invalid Video', 'Video duration must be 60 seconds or less.');
          return;
        }
        setForm(prev => ({ ...prev, trimStart: '0', trimEnd: String(Math.floor(durationSec)) }));
        setNewAdMedia(asset);
        // Open custom visual trimmer
        setVideoTrimmerVisible(true);
      } else {
        setNewAdMedia(asset);
      }
    }
  };`;

if (code.includes('allowsEditing: true,')) {
    code = code.replace(oldPickMedia, newPickMedia);
}

// 4. Update the manual trimming UI block
const oldManualTrimBlock = `{newAdMedia.type === 'video' && (
                      <View className="bg-slate-50 dark:bg-[#0D1117] p-3 rounded-xl border border-slate-200 dark:border-[#30363D]">
                        <Text className="text-slate-700 dark:text-slate-300 font-bold mb-2 text-xs">Video Trimming</Text>
                        <Text className="text-slate-500 text-[10px] mb-3">Original Duration: {Math.floor(newAdMedia.duration / 1000)}s</Text>
                        <View className="flex-row items-center justify-between">
                          <View className="flex-1 mr-2">
                            <Text className="text-slate-500 text-[10px] mb-1 font-bold uppercase">Trim Start (sec)</Text>
                            <TextInput 
                              value={form.trimStart}
                              onChangeText={val => setForm(prev => ({...prev, trimStart: val}))}
                              keyboardType="numeric"
                              className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] rounded-lg p-2 text-slate-900 dark:text-white font-bold text-center"
                            />
                          </View>
                          <View className="flex-1 ml-2">
                            <Text className="text-slate-500 text-[10px] mb-1 font-bold uppercase">Trim End (sec)</Text>
                            <TextInput 
                              value={form.trimEnd}
                              onChangeText={val => setForm(prev => ({...prev, trimEnd: val}))}
                              keyboardType="numeric"
                              className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] rounded-lg p-2 text-slate-900 dark:text-white font-bold text-center"
                            />
                          </View>
                        </View>
                        <View className="mt-3 bg-amber-50 dark:bg-amber-900/20 py-2 rounded-lg items-center border border-amber-200 dark:border-amber-700/50">
                          <Text className="text-amber-700 dark:text-amber-500 font-bold text-xs">Final Duration: {parseInt(form.trimEnd) - parseInt(form.trimStart) || 0}s</Text>
                        </View>
                      </View>
                    )}`;

const newManualTrimBlock = `{newAdMedia.type === 'video' && (
                      <View className="bg-slate-50 dark:bg-[#0D1117] p-4 rounded-xl border border-slate-200 dark:border-[#30363D] flex-row justify-between items-center">
                        <View className="flex-row items-center flex-1">
                          <View className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full items-center justify-center mr-3">
                            <Check size={20} className="text-emerald-500" />
                          </View>
                          <View>
                            <Text className="text-slate-900 dark:text-white font-black text-sm">Video Ready</Text>
                            <Text className="text-slate-500 font-bold text-xs mt-0.5">Duration: {parseInt(form.trimEnd) - parseInt(form.trimStart) || 0} sec</Text>
                          </View>
                        </View>
                        <TouchableOpacity 
                          onPress={() => setVideoTrimmerVisible(true)}
                          className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] px-4 py-2 rounded-lg shadow-sm"
                        >
                          <Text className="text-slate-700 dark:text-slate-300 font-bold text-xs">Edit Trim</Text>
                        </TouchableOpacity>
                      </View>
                    )}`;

if (code.includes('Video Trimming')) {
    code = code.replace(oldManualTrimBlock, newManualTrimBlock);
}

// 5. Add Modal rendering at the end, just before the final </SafeAreaView>
const modalCode = `
      <Modal visible={videoTrimmerVisible} animationType="slide" onRequestClose={() => setVideoTrimmerVisible(false)}>
        {newAdMedia && newAdMedia.type === 'video' && (
          <VideoTrimmer 
            uri={newAdMedia.uri} 
            originalDurationSec={Math.floor((newAdMedia.duration || 0) / 1000)}
            onSave={(trimData) => {
              if (trimData.start >= trimData.end) {
                Alert.alert('Invalid Trim', 'Start time must be less than end time.');
                return;
              }
              setForm(prev => ({
                ...prev,
                trimStart: String(Math.floor(trimData.start)),
                trimEnd: String(Math.ceil(trimData.end))
              }));
              setVideoTrimmerVisible(false);
            }}
            onCancel={() => setVideoTrimmerVisible(false)}
          />
        )}
      </Modal>

    </SafeAreaView>`;

if (!code.includes('videoTrimmerVisible} animationType="slide"')) {
    code = code.replace(/<\/SafeAreaView>[\s]*\);[\s]*\}\s*$/, modalCode + "\n  );\n}");
}

fs.writeFileSync('src/screens/main/CreateCampaignScreen.jsx', code);
console.log('Video trimmer integration complete');
