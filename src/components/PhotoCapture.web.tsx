import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { PhotoPlaceholder } from './PhotoPlaceholder';

/**
 * Real photo capture for the web build.
 *
 *  - mode="camera": opens the device camera via getUserMedia, shows a live
 *    preview, and captures the current frame to a data URL through a canvas.
 *  - mode="upload": opens the file picker and reads the chosen image to a data
 *    URL.
 *  - Either way the parent receives the image via `onCapture` and shows a
 *    "Retake" affordance backed by `onClear`.
 *
 * This is the `.web` variant; Metro resolves PhotoCapture.tsx (native) off-web.
 * We render real DOM <video>/<canvas>/<input> elements (react-native-web renders
 * through react-dom, so host tags work) and style them with plain DOM styles.
 */
type Props = {
  mode: 'camera' | 'upload';
  captured: string | null;
  onCapture: (dataUrl: string) => void;
  onClear: () => void;
};

export function PhotoCapture({ mode, captured, onCapture, onClear }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [camError, setCamError] = useState<string | null>(null);
  const [camReady, setCamReady] = useState(false);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCamReady(false);
  };

  // Start / stop the camera stream based on mode + whether we already captured.
  useEffect(() => {
    let cancelled = false;
    if (mode === 'camera' && !captured) {
      const nav = typeof navigator !== 'undefined' ? navigator : undefined;
      if (!nav?.mediaDevices?.getUserMedia) {
        setCamError('Camera isn’t available in this browser — use Upload instead.');
        return;
      }
      nav.mediaDevices
        .getUserMedia({ video: { facingMode: 'environment' }, audio: false })
        .then((stream) => {
          if (cancelled) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
          }
          setCamReady(true);
          setCamError(null);
        })
        .catch((err: any) => {
          setCamError(
            err?.name === 'NotAllowedError'
              ? 'Camera permission was denied. Allow it, or use Upload instead.'
              : 'Couldn’t open the camera — use Upload instead.',
          );
        });
    }
    return () => {
      cancelled = true;
      stopStream();
    };
  }, [mode, captured]);

  const takePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1080;
    canvas.height = video.videoHeight || 810;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    onCapture(canvas.toDataURL('image/jpeg', 0.85));
    stopStream();
  };

  const pickFile = () => fileRef.current?.click();

  const onFile = (e: any) => {
    const file: File | undefined = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onCapture(String(reader.result));
    reader.readAsDataURL(file);
  };

  // Hidden file input, always present so Upload works in either mode.
  const hiddenInput = (
    <input
      ref={fileRef}
      type="file"
      accept="image/*"
      onChange={onFile}
      style={{ display: 'none' }}
    />
  );

  // --- Already captured: show the real image + Retake ------------------------
  if (captured) {
    return (
      <View className="flex-1">
        <View className="flex-1 overflow-hidden rounded-xl">
          <img
            src={captured}
            alt="Captured dish"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </View>
        <Pressable
          onPress={onClear}
          className="mt-2.5 items-center justify-center rounded-md border-border bg-surface active:opacity-90"
          style={{ height: 44, borderWidth: 1.5 }}
        >
          <Text className="font-body-semibold text-14 text-primary">↻ Retake</Text>
        </Pressable>
        {hiddenInput}
      </View>
    );
  }

  // --- Upload mode (or camera unavailable) -----------------------------------
  if (mode === 'upload' || camError) {
    return (
      <View className="flex-1">
        <Pressable
          onPress={pickFile}
          className="flex-1 overflow-hidden rounded-xl active:opacity-90"
        >
          <PhotoPlaceholder caption="Tap to choose a photo from your device" />
        </Pressable>
        {camError ? (
          <Text className="mt-2 font-body text-12 text-danger">{camError}</Text>
        ) : null}
        {hiddenInput}
      </View>
    );
  }

  // --- Camera mode: live preview + capture -----------------------------------
  return (
    <View className="flex-1">
      <View className="flex-1 overflow-hidden rounded-xl bg-surface-sunken">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </View>
      <View className="mt-2.5 flex-row gap-2.5">
        <Pressable
          onPress={takePhoto}
          disabled={!camReady}
          className="flex-1 items-center justify-center rounded-md bg-accent active:opacity-90"
          style={{ height: 48, opacity: camReady ? 1 : 0.5 }}
        >
          <Text className="font-body-bold text-14 text-on-accent">📸 Capture</Text>
        </Pressable>
        <Pressable
          onPress={pickFile}
          className="items-center justify-center rounded-md border-border bg-surface px-4 active:opacity-90"
          style={{ height: 48, borderWidth: 1.5 }}
        >
          <Text className="font-body-semibold text-14 text-primary">Upload</Text>
        </Pressable>
      </View>
      {hiddenInput}
    </View>
  );
}
