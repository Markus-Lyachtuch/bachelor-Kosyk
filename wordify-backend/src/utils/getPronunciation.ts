const arpabetToIpaMapping: Record<string, string> = {
  AA: "ɑ",
  AE: "æ",
  AH: "ʌ",
  AO: "ɔ",
  AW: "aʊ",
  AY: "aɪ",
  B: "b",
  CH: "tʃ",
  D: "d",
  DH: "ð",
  EH: "ɛ",
  ER: "ɝ",
  EY: "eɪ",
  F: "f",
  G: "ɡ",
  HH: "h",
  IH: "ɪ",
  IY: "i",
  JH: "dʒ",
  K: "k",
  L: "l",
  M: "m",
  N: "n",
  NG: "ŋ",
  OW: "oʊ",
  OY: "ɔɪ",
  P: "p",
  R: "ɹ",
  S: "s",
  SH: "ʃ",
  T: "t",
  TH: "θ",
  UH: "ʊ",
  UW: "u",
  V: "v",
  W: "w",
  Y: "j",
  Z: "z",
  ZH: "ʒ",
};

export function convertArpabetToIpa(arpabet: string): string {
  if (!arpabet) return "";

  const phonemes = arpabet.trim().split(/\s+/);

  const ipaTranscription = phonemes.map((phoneme) => {
    const stressMatch = phoneme.match(/[0-9]/);
    const phonemeWithoutStress = phoneme.replace(/[0-9]/g, "");

    const ipa =
      arpabetToIpaMapping[phonemeWithoutStress] || phonemeWithoutStress;

    if (stressMatch) {
      if (stressMatch[0] === "1") {
        return `ˈ${ipa}`;
      } else if (stressMatch[0] === "2") {
        return `ˌ${ipa}`;
      }
    }
    return ipa;
  });

  return `/${ipaTranscription.join("")}/`;
}

export function getPronunciation(pron: string) {
  if (pron) {
    const arpabetString = pron.replace("pron:", "").trim();    
    const ipa = convertArpabetToIpa(arpabetString);
    return ipa;
  }
}
