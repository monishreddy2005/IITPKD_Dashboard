import random

def rollno():
    a = 'b'
    for i in range(9):
        a += str(random.randint(0, 9))
    return a

def name():
    char_list = [chr(ord('a') + i) for i in range(26)]
    name = ''.join(random.choice(char_list) for _ in range(10))
    return name

def program():
    return random.choice(['BTech', 'MTech', 'MSc', 'MS', 'PhD'])

def yearofadmission():
    return str(random.randint(2015, 2025))

def batch():
    return random.choice(['Jan', 'Jul'])

def branch():
    return random.choice([
        'Civil Engineering',
        'Computer Science and Engineering',
        'Electrical Engineering',
        'Mechanical Engineering'
    ])

def department():
    return random.choice([
        'Civil Engineering',
        'Computer Science and Engineering',
        'Electrical Engineering',
        'Mechanical Engineering'
    ])

def pwd():
    return random.choice(['Yes', 'No'])

def state():
    states_of_india = [
        "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa",
        "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
        "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
        "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
        "Uttar Pradesh", "Uttarakhand", "West Bengal"
    ]
    return random.choice(states_of_india)

def category():
    return random.choice(['Gen','EWS','OBC','SC','ST'])

def gender():
    return random.choice(['Male', 'Female', 'Transgender'])

def status():
    return random.choice(['Graduated', 'Ongoing', 'Slowpace'])

def main():
    entries = int(input("Enter number of entries you want to add: "))
    with open('students.csv', 'w', encoding='utf-8') as file:
        file.write('rollno,name,program,yearofadmission,batch,branch,department,pwd,state,category,gender,status\n')
        for _ in range(entries):
            line = ",".join([
                rollno(),
                name(),
                program(),
                yearofadmission(),
                batch(),
                branch(),
                department(),
                pwd(),
                state(),
                category(),
                gender(),
                status()
            ])
            file.write(line + "\n")

if __name__ == "__main__":
    main()
