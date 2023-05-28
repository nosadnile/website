import os
import json

cwd = os.path.dirname(os.path.realpath(__file__))
folder = os.path.join(cwd, "..", "public", "lang")

settings_raw = open(os.path.join(folder, "settings.json")).read()
settings = json.loads(settings_raw)

for filename in os.listdir(folder):
    if filename.endswith(".json"):
        lang_id = filename[:-5]
        lang_name = next((x["name"] for x in settings["languages"] if x["locale"] == lang_id), lang_id)

        content = """
            {
                code: "%s",
                name: "%s",
                file: "%s",
            },
        """ % (lang_id, lang_name, filename)

        print(content)
