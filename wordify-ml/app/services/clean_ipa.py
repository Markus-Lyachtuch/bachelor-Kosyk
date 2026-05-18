import re

def clean_ipa(ipa_text):
    """
    It cleans from additional symbols
    Input/Output: "/ˈæp.əl/" -> Вихід: "æpəl"
    """
    return re.sub(r'[\\/ˈˌ. ]', '', ipa_text)
