import os

files = [
    'OpenHouseSection.jsx', 'NptelSection.jsx', 'UbaSection.jsx', 'SocialEngagements.jsx', 'StudentsEngagement.jsx', 'OutreachSection.jsx'
]

path = 'Frontend/src/components'
for f in files:
    filepath = os.path.join(path, f)
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as file:
            content = file.read()
            count = content.count('className="page-back-btn"')
            print(f'{f}: {count} back buttons')
