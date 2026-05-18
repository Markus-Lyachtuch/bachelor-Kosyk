import re
from llama_cpp import Llama
from typing import List, Dict, Any

llm = Llama.from_pretrained(
    repo_id="bartowski/SmolLM2-360M-Instruct-GGUF",
    filename="SmolLM2-360M-Instruct-Q4_K_M.gguf",
    n_ctx=1024,
    n_threads=3,
    verbose=True
)

def chunk_list(lst, chunk_size):
    return [lst[i:i + chunk_size] for i in range(0, len(lst), chunk_size)]
    
def generate_story(words: List[str]) -> Dict[str, Any]:
    full_story_sentences = []
    used_words_ordered = []
    
    system_prompt = (
        "You are an AI that writes simple sentences for English learners (A2 level). "
        "Come up with random name of student. You write about a student named who is having an adventure at school. "
        "Write ONLY the sentence requested. No explanations, no quotes, no conversational text."
    )

    for i, word in enumerate(words):
        prompt = (
            f"Write EXACTLY ONE short sentence (under 12 words) about (use the name you came up with) using the word '{word}'. {'replace Alex with he or him. Do not repeat this name in each sentence' if i > 0 else ''}"
            f"Do not write anything else. Just the sentence."
        )
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ]

        output = llm.create_chat_completion(
            messages=messages,
            max_tokens=30,
            temperature=0.6,
            min_p=0.1,
            repeat_penalty=1.2,
            presence_penalty=0.5
        )

        sentence = output["choices"][0]["message"]["content"].strip()
        
        sentence = re.sub(r'^.*?:[\s\n]*', '', sentence)
        sentence = sentence.replace('"', '').replace('\n', ' ').strip()
        
        if '.' in sentence:
            sentence = sentence.split('.')[0] + '.'
        elif '!' in sentence:
            sentence = sentence.split('!')[0] + '!'
        else:
            sentence += '.'

        full_story_sentences.append(sentence)

    full_story = " ".join(full_story_sentences)
    masked_story = full_story

    for word in words:
        pattern = re.compile(rf'\b({re.escape(word)}[a-z]*)\b', re.IGNORECASE)
        match = pattern.search(masked_story)
        
        if match:
            masked_story = pattern.sub("____", masked_story, count=1)
            used_words_ordered.append(word)
        

    return {
        "original_story": full_story.strip(),
        "masked_story": masked_story.strip(),
        "used_words": used_words_ordered,
    }
    
def generate_similar_words(input_words: list, count: int = 5) -> str:
    words_str = ", ".join(input_words)
    blocked_words = {w.strip().lower() for w in input_words if str(w).strip()}

    messages = [
        {
            "role": "system",
            "content": "You are a word generator. Output exactly a comma-separated list of related words in the same category. No introductory text, no explanations, no lists."
        },
        {
            "role": "user",
            "content": f"Category examples: apple, banana. Generate {count} more."
        },
        {
            "role": "assistant",
            "content": "orange, kiwi, mango, pear, grape"
        },
        {
            "role": "user",
            "content": f"Category examples: {words_str}. Generate {count} more."
        }
    ]

    output = llm.create_chat_completion(
        messages=messages,
        max_tokens=50,
        temperature=0.4,
        top_p=0.9
    )

    text = output["choices"][0]["message"]["content"].strip()
    
    text = text.replace('\n', ',') 
    text = re.sub(r"[-*•]", "", text)
    text = re.sub(r"\([^)]*\)", "", text)
    text = re.sub(r"\b\d+[\.\)]\s*", "", text)
    text = text.replace('"', "").replace("'", "")
    
    candidates = [w.strip() for w in text.split(",") if w.strip()]
    filtered_words = []
    seen = set()

    for word in candidates:
        word = re.sub(r"^[^a-zA-Z]+|[^a-zA-Z]+$", "", word).strip()
        if not word:
            continue
            
        normalized = word.lower()
        if normalized in blocked_words or normalized in seen:
            continue
            
        seen.add(normalized)
        filtered_words.append(word)

    if len(filtered_words) < count:
        missing = count - len(filtered_words)
        retry_prompt = f"Category examples: {words_str}. Generate {missing} NEW words separated by commas."
        
        retry_output = llm.create_chat_completion(
            messages=[
                {"role": "system", "content": "Output only comma-separated words."},
                {"role": "user", "content": retry_prompt}
            ],
            max_tokens=40,
            temperature=0.5,
            top_p=0.9
        )
        retry_text = retry_output["choices"][0]["message"]["content"].strip()
        
        retry_text = retry_text.replace('\n', ',')
        retry_text = re.sub(r"[-*•]", "", retry_text)
        retry_text = re.sub(r"\b\d+[\.\)]\s*", "", retry_text)
        retry_text = retry_text.replace('"', "").replace("'", "")
        
        for word in [w.strip() for w in retry_text.split(",") if w.strip()]:
            word = re.sub(r"^[^a-zA-Z]+|[^a-zA-Z]+$", "", word).strip()
            if len(word.split(' ')) > 1:
                continue
            if not word:
                continue
            normalized = word.lower()
            if normalized in blocked_words or normalized in seen:
                continue
            seen.add(normalized)
            filtered_words.append(word)
            if len(filtered_words) >= count:
                break

    return ", ".join(filtered_words[:count])
