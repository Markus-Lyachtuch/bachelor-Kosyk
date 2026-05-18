import { useAtom } from "jotai";
import { useState } from "react";
import "./studySetSettings.styl";

import { isModalStudySetSettingsAtom } from "../model/atoms";

import { SettingItem } from "widgets/settingItem";
import { ModalSetSettings } from "widgets/modalSetSettings";

import Refresh from "shared/assets/icons/refresh.svg?react";
import SpeakerHigh from "shared/assets/icons/speakerHigh.svg?react";
import BrainDefault from "shared/assets/icons/brainDefault.svg?react";

import { Button } from "shared/ui/button";
import { fullInfoSetAtom } from "features/sets/fetchSetById/model/atoms";
import { resetSetProgress, toggleSetSettings } from "features/sets/api/setsApi";
import { ModalFolder } from "widgets/modalFolder";

export const StudySetSettings = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isResetProgressModalShowed, setIsResetProgressModalShowed] = useState<boolean>(false);

  const [isStudySetSettingsModalShowed, setIsStudySetSettingsShowed] = useAtom(
    isModalStudySetSettingsAtom,
  );

  const [fullSetInfo, setFullSetInfo] = useAtom(fullInfoSetAtom);

  const onCloseModal = () => setIsStudySetSettingsShowed(false);

  const toggleForgettingCurve = async (toggleSwitcher?: () => void) => {
    if (!fullSetInfo?.id) return;

    const result = await toggleSetSettings({
      isForgettingCurveEnabled:
        !fullSetInfo?.settings?.isForgettingCurveEnabled,
      id: fullSetInfo?.id,
    });

    if (!result.ok) {
      toggleSwitcher?.();
    }

    if (result.ok) {
      setFullSetInfo(prev => {
        if (!prev || !prev.settings) return prev;
        return {
          ...prev,
          settings: {
            ...prev.settings,
            isForgettingCurveEnabled: !prev.settings.isForgettingCurveEnabled,
          },
        };
      })
    }
  };

  const toggleAudio = async (toggleSwitcher?: () => void) => {
    if (!fullSetInfo?.id) return;

    const result = await toggleSetSettings({
      isAutoPlayAudioEnabled: !fullSetInfo.settings?.isAutoPlayAudioEnabled,
      id: fullSetInfo?.id,
    });

    if (!result.ok) {
      toggleSwitcher?.();
    }

    if (result.ok) {
      setFullSetInfo(prev => {
        if (!prev || !prev.settings) return prev;
        return {
          ...prev,
          settings: {
            ...prev.settings,
            isAutoPlayAudioEnabled: !prev.settings.isAutoPlayAudioEnabled,
          },
        };
      })
    }
  };

  const onResetSetProgress = async () => {
    if (!fullSetInfo?.id) return
    setIsLoading(true);
    const result = await resetSetProgress({
      loaderFinally: () => {
        setIsLoading(false)
        setIsResetProgressModalShowed(false);
      }, setId: fullSetInfo?.id
    });
    if (result.ok) {
      setFullSetInfo(result.data);
      onCloseModal();
    }
  };

  return (
    <div>
      <ModalSetSettings
        title="Settings"
        isModalShowed={isStudySetSettingsModalShowed}
        onClose={onCloseModal}
      >
        <main className="modal-set-settings-main">
          <div className="modal-set-settings-main-container flex-col">
            <SettingItem
              Icon={BrainDefault}
              onClick={toggleForgettingCurve}
              title="Turn on forgetting curve"
              isSwitcherEnabled={
                fullSetInfo?.settings?.isForgettingCurveEnabled
              }
              description="Optimize your review schedule using spaced repetition algorithms."
            />
            <div className="modal-set-settings-main-divider"></div>
            <SettingItem
              Icon={SpeakerHigh}
              onClick={toggleAudio}
              title="Auto-play audio"
              isSwitcherEnabled={fullSetInfo?.settings?.isAutoPlayAudioEnabled}
              description="Automatically play pronunciations when moving to the next card."
            />

            <div className="modal-set-settings-main-restart-btn-container flex-col">
              <Button
                onClick={() => setIsResetProgressModalShowed(true)}
                className="modal-set-settings-main-restart-btn flex-center"
                variant="auth"
              >
                Restart learning mode <Refresh />
              </Button>
              <p className="text-center modal-set-settings-main-restart-btn-warning">
                If you click on this button all your progress will be lost.
              </p>
            </div>
          </div>
        </main>
      </ModalSetSettings>
      <ModalFolder
        onClose={() => setIsResetProgressModalShowed(false)}
        isModalShowed={isResetProgressModalShowed}
        title="Reset Set"
        isLoading={isLoading}
        confirmBtnProps={{
          onClick: onResetSetProgress,
          text: "Reset",
          variant: "danger",
        }}
        cancelBtnProps={{
          onClick: () => setIsResetProgressModalShowed(false),
          text: "Cancel",
        }}
      >
        Are you sure you want to reset progress from "{fullSetInfo?.name}" set?
      </ModalFolder>
    </div>
  );
};
