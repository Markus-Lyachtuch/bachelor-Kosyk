import { CSSProperties, Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { Button } from "shared/ui/button";
import { MultiRecorder } from "react-ts-audio-recorder";
import pcmWorklet from "react-ts-audio-recorder/assets/pcm-worklet.js?url";
import Microphone from "shared/assets/icons/microphone.svg?react";
import SpeakerHigh from "shared/assets/icons/speakerHigh.svg?react";

import { checkPronunciation } from "features/study/api/wordsApi";
import { Loader } from "shared/ui/loader";
import { Title } from "shared/ui/title";
import "./checkPronunciation.styl";
import { IPronunciationCheck } from "../../model/word";
import { SET_STUDY_SCORE } from "shared/const/score";

interface CheckPronunciationProps {
  targetWord: string;
  targetPhonetic: string;
  isPronunciationResultReset?: boolean;
  onCheckPronunciation?: (result: number) => void;
  setIsPronunciationResultReset?: Dispatch<SetStateAction<boolean>>;
}

export const CheckPronunciation = (props: CheckPronunciationProps) => {
  const { onCheckPronunciation, isPronunciationResultReset, setIsPronunciationResultReset } = props;

  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isUserAudioPlaying, setIsUserAudioPlaying] = useState(false);
  const [responseUserPronunciation, setResponseUserPronunciation] =
    useState<IPronunciationCheck | null>(null);

  const recorderRef = useRef<MultiRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const sendPronunciation = async (blob: Blob) => {
    setIsLoading(true);

    const checkPronunciationResult = await checkPronunciation({
      ...props,
      audio: blob,
    });

    setIsLoading(false);

    if (checkPronunciationResult.ok) {
      setResponseUserPronunciation(checkPronunciationResult.data);
      onCheckPronunciation?.(checkPronunciationResult.data.feedback.reduce((acc, item) => acc + item.score, 0) / checkPronunciationResult.data.feedback.length);
    }
  };

  const start = async () => {
    try {
      const recorder = new MultiRecorder({
        format: "wav",
        sampleRate: 48000,
        workletURL: pcmWorklet,
      });
      recorderRef.current = recorder;
      await recorder.init();
      await recorder.startRecording();
      setIsRecording(true);
    } catch (error) {
      console.error("error", error);
    }
  };

  const stop = async () => {
    if (!recorderRef.current) return;

    try {
      const blob = await recorderRef.current.stopRecording();
      recorderRef.current.close();
      recorderRef.current = null;
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setIsRecording(false);
      await sendPronunciation(blob);
    } catch (error) {
      console.error("Failed to stop recording:", error);
    }
  };

  const getComputedColor = (score: number): CSSProperties => {
    if (score > SET_STUDY_SCORE.POSITIVE) {
      return { background: "var(--green)" };
    } else if (score > SET_STUDY_SCORE.NORMAL) {
      return { background: "var(--yellow)" };
    } else {
      return { background: "var(--error)" };
    }
  };

  useEffect(() => {
    if (isUserAudioPlaying) {
      audioRef.current?.play();
      setIsUserAudioPlaying(false);
    }

    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [isUserAudioPlaying]);

  useEffect(() => {
    if (isPronunciationResultReset) {
      setResponseUserPronunciation(null);
      setIsPronunciationResultReset?.(false);
    }
  }, [isPronunciationResultReset]);

  return (
    <div className="check-pronunciation flex-col">
      {isLoading ? (
        <Loader />
      ) : (
        <Button
          onPointerDown={start}
          onPointerUp={stop}
          variant="primary"
          className="flex-center check-pronunciation-btn"
        >
          <Microphone fill="white" width={16} height={16} />
          {isRecording ? "Stop recording" : "Check pronunciation"}
        </Button>
      )}
      {audioUrl && (
        <div>
          <Title fontWeight="semibold">Feedback</Title>
          <div className="flex-y-center">
            <SpeakerHigh
              width={24}
              height={24}
              onClick={() => setIsUserAudioPlaying(true)}
            />
            <span>User's audio</span>
            <audio src={audioUrl} ref={audioRef} />
          </div>
          <div className="check-pronunciation-feedback-container flex-col">
            {responseUserPronunciation &&
              responseUserPronunciation.feedback.map(({ score, word }, userPronunciationIndex) => (
                <div key={userPronunciationIndex} className="check-pronunciation-feedback-line flex-between-center">
                  <span>{word}</span>
                  <div
                    style={getComputedColor(score)}
                    className="flex-center check-pronunciation-feedback-line-result"
                  >
                    {score.toFixed(1)}
                  </div>
                </div>
              ))}
          </div>

          <p className="text-center check-pronunciation-feedback-text">{responseUserPronunciation && responseUserPronunciation.feedback[0].feedback}</p>
        </div>
      )}
    </div>
  );
};
