import { useEffect, useRef, useCallback } from "react";

export function useSpeechRecognition(isMicOn: boolean, onResult: (text: string) => void) {
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Support both standard and prefixed versions
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech Recognition API is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    // Set language as needed, e.g., recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      // Loop through new results
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          const transcript = event.results[i][0].transcript.trim();
          if (transcript) {
            onResult(transcript);
          }
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
    };

    // If it stops but mic is still on, we want to restart it (continuous mode sometimes stops on silence)
    recognition.onend = () => {
      if (isMicOn && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          // Ignored
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null; // prevent auto-restart loop
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, [isMicOn, onResult]);

  useEffect(() => {
    if (recognitionRef.current) {
      if (isMicOn) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          // Might already be started
        }
      } else {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignored
        }
      }
    }
  }, [isMicOn]);
}
