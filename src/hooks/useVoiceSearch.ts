import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

/**
 * Real speech-to-text for the Home "Ask" button.
 *
 * On web this drives the browser's Web Speech API (Chrome/Edge/Safari expose it
 * as `webkitSpeechRecognition`). It streams an interim transcript while the
 * user speaks and fires `onFinal` with the settled phrase. Microphone
 * permission is requested by the browser on first `start()`.
 *
 * `supported` is false on platforms/browsers without the API (e.g. Firefox, or
 * native without a speech module) — callers fall back to the text input, so the
 * feature is never a dead end.
 */

// The Web Speech API isn't in React Native's TS lib; reach through globalThis.
function getRecognitionCtor(): any {
  if (Platform.OS !== 'web' || typeof globalThis === 'undefined') return null;
  const g = globalThis as any;
  return g.SpeechRecognition ?? g.webkitSpeechRecognition ?? null;
}

export type VoiceStatus = 'idle' | 'listening' | 'error';

export function useVoiceSearch(onFinal: (transcript: string) => void) {
  const [status, setStatus] = useState<VoiceStatus>('idle');
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const onFinalRef = useRef(onFinal);
  onFinalRef.current = onFinal;

  const supported = getRecognitionCtor() != null;

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      setError('Voice input isn’t available in this browser — type your request instead.');
      setStatus('error');
      return;
    }
    // Tear down any previous instance.
    recognitionRef.current?.abort?.();

    const recognition = new Ctor();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    setTranscript('');
    setError(null);
    setStatus('listening');

    recognition.onresult = (event: any) => {
      let text = '';
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }
      text = text.trim();
      setTranscript(text);
      // When the engine marks the last chunk final, settle the query.
      const last = event.results[event.results.length - 1];
      if (last?.isFinal && text.length > 0) {
        onFinalRef.current(text);
      }
    };

    recognition.onerror = (event: any) => {
      const code = event?.error;
      setError(
        code === 'not-allowed' || code === 'service-not-allowed'
          ? 'Microphone permission was denied. Allow mic access, or type your request.'
          : code === 'no-speech'
            ? 'Didn’t catch that — try again or type your request.'
            : 'Voice input failed — type your request instead.',
      );
      setStatus('error');
    };

    recognition.onend = () => {
      setStatus((s) => (s === 'listening' ? 'idle' : s));
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      // start() throws if called while already running — ignore.
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setTranscript('');
    setError(null);
  }, []);

  // Stop listening if the component unmounts mid-capture.
  useEffect(() => () => recognitionRef.current?.abort?.(), []);

  return { supported, status, transcript, error, start, stop, reset };
}
