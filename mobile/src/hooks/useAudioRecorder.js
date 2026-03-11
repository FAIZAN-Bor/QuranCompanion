// Custom hook for audio recording using react-native-audio-recorder-player
import { useState, useRef, useCallback, useEffect } from 'react';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';

const audioRecorderPlayer = new AudioRecorderPlayer();

/**
 * useAudioRecorder - Hook for recording audio
 * 
 * Returns:
 *  - isRecording: boolean
 *  - recordingTime: string (formatted MM:SS)
 *  - recordingSeconds: number
 *  - audioPath: string | null (path to recorded file)
 *  - isPlaying: boolean
 *  - playbackTime: string
 *  - startRecording: () => Promise<void>
 *  - stopRecording: () => Promise<string>
 *  - playRecording: () => Promise<void>
 *  - stopPlayback: () => Promise<void>
 *  - resetRecording: () => void
 */
const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState('00:00');
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioPath, setAudioPath] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState('00:00');
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // Cleanup: stop any ongoing recording/playback
      try {
        audioRecorderPlayer.stopRecorder().catch(() => {});
        audioRecorderPlayer.stopPlayer().catch(() => {});
        audioRecorderPlayer.removeRecordBackListener();
        audioRecorderPlayer.removePlayBackListener();
      } catch (e) {
        // Ignore cleanup errors
      }
    };
  }, []);

  // Request microphone permissions (Android)
  const requestPermissions = useCallback(async () => {
    if (Platform.OS === 'android') {
      try {
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);

        const audioGranted = grants[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] === PermissionsAndroid.RESULTS.GRANTED;

        if (!audioGranted) {
          Alert.alert(
            'Permission Required',
            'Microphone permission is needed to record your recitation. Please enable it in Settings.',
            [{ text: 'OK' }]
          );
          return false;
        }
        return true;
      } catch (err) {
        console.warn('Permission error:', err);
        return false;
      }
    }
    return true; // iOS handles permissions automatically
  }, []);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      // Reset state
      setAudioPath(null);
      setRecordingTime('00:00');
      setRecordingSeconds(0);

      // Configure recording path
      // By passing undefined, react-native-audio-recorder-player generates a valid cache path automatically
      const result = await audioRecorderPlayer.startRecorder(undefined, {
        SampleRate: 44100,
        Channels: 1,      // Mono for speech
        AudioEncoding: 'aac',
        OutputFormat: 'mpeg_4',
      });

      audioRecorderPlayer.addRecordBackListener((e) => {
        if (!mountedRef.current) return;
        const secs = Math.floor(e.currentPosition / 1000);
        setRecordingSeconds(secs);
        setRecordingTime(formatTime(secs));
      });

      if (mountedRef.current) {
        setIsRecording(true);
        setAudioPath(result);
      }

      return result;
    } catch (error) {
      console.error('Start recording error:', error);
      Alert.alert('Recording Error', 'Failed to start recording. Please try again.');
      return null;
    }
  }, [requestPermissions]);

  // Stop recording
  const stopRecording = useCallback(async () => {
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();

      if (mountedRef.current) {
        setIsRecording(false);
        setAudioPath(result);
      }

      return result;
    } catch (error) {
      console.error('Stop recording error:', error);
      if (mountedRef.current) {
        setIsRecording(false);
      }
      return null;
    }
  }, []);

  // Play recorded audio
  const playRecording = useCallback(async () => {
    if (!audioPath) return;

    try {
      await audioRecorderPlayer.startPlayer(audioPath);
      audioRecorderPlayer.addPlayBackListener((e) => {
        if (!mountedRef.current) return;
        const secs = Math.floor(e.currentPosition / 1000);
        setPlaybackTime(formatTime(secs));

        if (e.currentPosition >= e.duration) {
          if (mountedRef.current) {
            setIsPlaying(false);
            setPlaybackTime('00:00');
          }
          audioRecorderPlayer.stopPlayer().catch(() => {});
          audioRecorderPlayer.removePlayBackListener();
        }
      });

      if (mountedRef.current) {
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Play recording error:', error);
    }
  }, [audioPath]);

  // Stop playback
  const stopPlayback = useCallback(async () => {
    try {
      await audioRecorderPlayer.stopPlayer();
      audioRecorderPlayer.removePlayBackListener();
      if (mountedRef.current) {
        setIsPlaying(false);
        setPlaybackTime('00:00');
      }
    } catch (error) {
      console.error('Stop playback error:', error);
    }
  }, []);

  // Reset recording state
  const resetRecording = useCallback(() => {
    setAudioPath(null);
    setRecordingTime('00:00');
    setRecordingSeconds(0);
    setIsPlaying(false);
    setPlaybackTime('00:00');
  }, []);

  return {
    isRecording,
    recordingTime,
    recordingSeconds,
    audioPath,
    isPlaying,
    playbackTime,
    startRecording,
    stopRecording,
    playRecording,
    stopPlayback,
    resetRecording,
  };
};

// Format seconds to MM:SS
function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default useAudioRecorder;
