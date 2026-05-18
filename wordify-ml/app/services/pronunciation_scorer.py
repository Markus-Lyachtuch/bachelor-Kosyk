import Levenshtein
from app.services.clean_ipa import clean_ipa

def score_pronunciation(target_phonem: str, user_phonem: str, multiple_words: bool = False):
    target_simple = clean_ipa(target_phonem)
    recognized_simple = clean_ipa(user_phonem)

    if multiple_words:
        if target_simple in recognized_simple and len(target_simple) > 0:
            distance = 0
            max_len = len(target_simple)
        else:
            min_dist = float('inf')
            t_len = len(target_simple)
            r_len = len(recognized_simple)
            
            if r_len >= t_len and t_len > 0:
                for i in range(r_len - t_len + 1):
                    sub_rec = recognized_simple[i:i+t_len]
                    dist = Levenshtein.distance(target_simple, sub_rec)
                    if dist < min_dist:
                        min_dist = dist
                        
                    if i + t_len < r_len:
                        sub_rec_plus = recognized_simple[i:i+t_len+1]
                        dist_plus = Levenshtein.distance(target_simple, sub_rec_plus)
                        if dist_plus < min_dist:
                            min_dist = dist_plus
                            
                distance = min_dist
                max_len = t_len
            else:
                distance = Levenshtein.distance(target_simple, recognized_simple)
                max_len = max(len(target_simple), len(recognized_simple))
    else:
        distance = Levenshtein.distance(target_simple, recognized_simple)
        max_len = max(len(target_simple), len(recognized_simple))

    score = 0
    if max_len == 0:
        score = 100.0
    else:
        score = ((max_len - distance) / max_len) * 100
            
    score = round(score, 2)
    is_correct = score > 50.0

    return { "is_correct": is_correct, "score": score, "distance": distance, "target_simple": target_simple, "recognized_simple": recognized_simple }
