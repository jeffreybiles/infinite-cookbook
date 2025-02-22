from my_types import Preferences

def preferences_prompt(preferences: Preferences):
    string = ""
    if preferences["avoid"]:
        string += f"Avoid the following ingredients: {', '.join(preferences['avoid'])}\n"
    if preferences["lifestyle"]:
        string += f"Follow the following lifestyle: {', '.join(preferences['lifestyle'])}\n"
    if preferences["spiceLevel"]:
        string += f"Have the following spice level, if applicable, to this recipe (ignore if dish does not require spice): {preferences['spiceLevel']}\n"
    if preferences["custom"]:
        string += f"Also keep the following in mind, if applicable: {preferences['custom']}\n"
    return string
