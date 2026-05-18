import SpeakerHigh from "shared/assets/icons/speakerHigh.svg?react";
import { IPhonetic } from "../../model/word";
import { useEffect, useRef, useState } from "react";
import "./playSound.styl";
import { useAtom } from "jotai";
import { fullInfoSetAtom } from "features/sets/fetchSetById/model/atoms";

interface PlaySoundProps extends IPhonetic {
  width: number;
  height: number;
  variant: string | null;
  phoneticIndex?: number;
  onClickSound?: () => void;
}

export const PlaySound = ({
  text,
  audioUrl,
  onClickSound,
  phoneticIndex,
  width,
  height,
  variant,
}: PlaySoundProps) => {
  const audioPlayRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [fullSetInfo] = useAtom(fullInfoSetAtom);

  const onPlaySound = () => {
    onClickSound?.();
    setIsPlaying(true);
  }

  useEffect(() => {
    if (isPlaying) {
      audioPlayRef.current?.play();
      setIsPlaying(false);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (fullSetInfo && fullSetInfo.settings?.isAutoPlayAudioEnabled && phoneticIndex === 0) {
      onPlaySound();
    }
  }, [fullSetInfo])

  return (
    <div onClick={onPlaySound} className="flex-y-center study-page-phonetic">
      {audioUrl && (
        <div className="study-page-phonetic-speaker">
          <SpeakerHigh
            width={width}
            height={height}
          />
          <span className="study-page-phonetic-speaker-variant">
            {variant ?? ""}
          </span>
        </div>
      )}
      <span className="study-page-phonetic-text">{text}</span>
      {audioUrl && <audio src={audioUrl} ref={audioPlayRef} />}
    </div>
  );
};
