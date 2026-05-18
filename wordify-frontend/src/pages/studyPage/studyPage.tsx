import "./studyPage.styl";
import { Title } from "shared/ui/title";
import { Loader } from "shared/ui/loader";
import { useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { IWord } from "features/study/words/model/word";
import { fetchWordInfo } from "features/study/api/wordsApi";
import { CheckPronunciation, PlaySound } from "features/study/words/ui";

export const StudyPage = () => {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<IWord | null>(null);
  const word = useMemo(() => searchParams.get("word"), [searchParams]);

  const splittedWord = word ? word.split("_") : null;
  const targetWord = response ? response.word : splittedWord!.join(" ");
  const targetPhonetic =
    response && response.phonetics.length > 0 ? response.phonetics[0].text : "";

  useEffect(() => {
    if (!word || (splittedWord && splittedWord.length > 1)) return;
    setIsLoading(true);

    (async () => {
      const result = await fetchWordInfo({ word, langCode: "en" });
      if (result.ok) {
        setResponse(result.data);
      } else {
        setError(result.error.message);
      }
      setIsLoading(false);
    })();
  }, [word, fetchWordInfo]);

  return (
    <div className="study-page flex-col flex-y-center">
      {isLoading ? (
        <div className="flex-center">
          <Loader />
        </div>
      ) : (
        <div className="study-page-pronunciation-practice flex-center flex-col">
          <Title variant="primary" fontWeight="semibold">
            Practice your pronunciation
          </Title>
          {response || !error ? (
            <div className="study-page-pronunciation-practice-block flex-center flex-col">
              <Title>
                {response ? response.word : splittedWord!.join(" ")}
              </Title>
              <div className="flex-y-center study-page-pronunciation-block">
                {response &&
                  response.phonetics.map((phonetic) => (
                    <PlaySound
                      key={phonetic.id}
                      {...phonetic}
                      width={16}
                      height={16}
                    />
                  ))}
              </div>
              <CheckPronunciation
                targetWord={targetWord}
                targetPhonetic={targetPhonetic}
              />
            </div>
          ) : (
            <p className="text-error">{error} :(</p>
          )}
        </div>
      )}
    </div>
  );
};
