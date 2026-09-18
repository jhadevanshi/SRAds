const fs = require('fs');

let content = fs.readFileSync('src/screens/main/UploadAdScreen.jsx', 'utf8');

// 1. Import VideoTrimmer
content = content.replace(
  "import { ArrowLeft, UploadCloud, FileVideo, Image as ImageIcon, CheckCircle2, Megaphone, Trash2 } from 'lucide-react-native';",
  "import { ArrowLeft, UploadCloud, FileVideo, Image as ImageIcon, CheckCircle2, Megaphone, Trash2 } from 'lucide-react-native';\nimport VideoTrimmer from '../../components/VideoTrimmer';"
);

// 2. Add State
content = content.replace(
  "const [showSuccess, setShowSuccess] = useState(false);",
  "const [showSuccess, setShowSuccess] = useState(false);\n  const [showTrimmer, setShowTrimmer] = useState(false);\n  const [trimData, setTrimData] = useState(null);"
);

// 3. Update pickMedia
const oldPickMedia = `    if (!result.canceled) {
      const asset = result.assets[0];
      
      // Validate Video duration
      if (asset.type === 'video') {
        const durationSec = (asset.duration || 0) / 1000;
        if (durationSec > 60) {
          Alert.alert('Invalid Video', 'Video duration must be 60 seconds or less.');
          return;
        }
      }
      setMedia(asset);
    }`;

const newPickMedia = `    if (!result.canceled) {
      const asset = result.assets[0];
      setMedia(asset);
      setTrimData(null);
      if (asset.type === 'video') {
        setShowTrimmer(true);
      }
    }`;

content = content.replace(oldPickMedia, newPickMedia);

// 4. Update handleUpload formData
const oldFormData = `      formData.append('budget', '0'); 
      formData.append('cost_per_play', media.type === 'video' ? '2' : '1');`;

const newFormData = `      formData.append('budget', '0'); 
      formData.append('cost_per_play', media.type === 'video' ? '2' : '1');
      if (media.type === 'video' && trimData) {
        formData.append('video_trim_start', trimData.start.toString());
        formData.append('video_trim_end', trimData.end.toString());
        formData.append('play_duration', trimData.duration.toString());
      }`;

content = content.replace(oldFormData, newFormData);

// 5. Render VideoTrimmer
const oldReturn = `  if (showSuccess) {`;
const newReturn = `  if (showTrimmer && media?.type === 'video') {
    return (
      <VideoTrimmer 
        uri={media.uri}
        originalDurationSec={(media.duration || 0) / 1000}
        onSave={(data) => {
          setTrimData(data);
          setShowTrimmer(false);
        }}
        onCancel={() => {
          setShowTrimmer(false);
          setMedia(null);
        }}
      />
    );
  }

  if (showSuccess) {`;

content = content.replace(oldReturn, newReturn);

// 6. Update the video info display in the normal UI to show trim info
const oldVideoDisplay = `                  <Text className="text-white font-bold mb-1">Selected Video</Text>
                  <Text className="text-slate-300 text-xs">{(media.duration / 1000).toFixed(1)} seconds</Text>`;
const newVideoDisplay = `                  <Text className="text-white font-bold mb-1">Selected Video</Text>
                  <Text className="text-slate-300 text-xs">{trimData ? trimData.duration.toFixed(1) : (media.duration / 1000).toFixed(1)} seconds {trimData ? '(Trimmed)' : ''}</Text>
                  {!trimData && (
                    <TouchableOpacity onPress={() => setShowTrimmer(true)} className="mt-2 bg-amber-500/20 px-3 py-1 rounded-full self-start border border-amber-500/50">
                      <Text className="text-amber-500 text-xs font-bold">Trim Video</Text>
                    </TouchableOpacity>
                  )}`;

content = content.replace(oldVideoDisplay, newVideoDisplay);

fs.writeFileSync('src/screens/main/UploadAdScreen.jsx', content);
console.log('Fixed UploadAdScreen!');
