import csv
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.ticker as ticker


DEMOGRAPHICS = False
RACE_COUNT = True

POSITIONS_AND_PAY = True
TEACHER_CLASSROOM = True


def demographics():
    with open('demographics.tsv', newline='') as f:
        reader = csv.reader(f, delimiter='\t', quotechar='"')

        data = []

        # files have a header row
        # ['Name', 'Primary Job Title', 'Hire Date', 'Gender', 'Race', 'Ethnicity']
        header = reader.__next__()
        
        for row in reader:
            data.append(dict(zip(header, row)))
        row_count = len(data)

        if RACE_COUNT:
            race_count = dict()
            race_count['Undisclosed'] = 0
            for row in data:
                race = row.get('Race')
                    
                if race is None:
                    raise RuntimeError(row)

                if race == '':
                    race_count['Undisclosed'] += 1
                elif race_count.get(race) is None:
                    race_count[race] = 1
                else:
                    race_count[race] += 1

            print(f'{"Race".ljust(50)}\t{"Count".ljust(5)}\t{"Percentage".ljust(15)}')
            for race in race_count:
                count = race_count[race]
                print(f'{race.ljust(50)}\t{str(count).ljust(5)}\t{str(count/row_count*10000//1/100).ljust(15)}')


def positions_and_pay():
    with open('positions_and_pay.tsv', newline='') as f:
        reader = csv.reader(f, delimiter='\t', quotechar='"')

        data = []

        # files have a header row
        # ['Name', 'Amount', 'Description', 'Hire Date']
        header = reader.__next__()
        
        for row in reader:
            # convert "$######" string to number
            row[1] = money_to_float(row[1])
            data.append(dict(zip(header, row)))
        row_count = len(data)

        # includes only positions that contain the word teacher
        # does not contains positions such as "teaching assistant"
        teaching_positions = [
            'S - Teacher - Instructional Technology',
            'S - Teacher - Media Specialist',
            'S - Teacher - Sp Ed Temporary',
            'S - Teacher - World Language Long Term Sub',
            'S - Teacher - FMLA Sub Reading Specialist',
            'S - Teacher - Guidance Counselor',
            'S - Teacher - Elementary STEAM',
            'S - Teacher - Math Coach',
            'S - Teacher - Instructional Leader Math',
            'S - Teacher - Reading/Literacy Specialist',
            'S - Teacher - World Language',
            'S - Teacher - Occupational Therapist',
            'S - Teacher - Physical Education',
            'S - Teacher - FMLA Sub Special Education',
            'S - Teacher - Science Center K-5 Engineering',
            'S - Teacher - Temporary World Language',
            'S - Teacher - Long Term Sub Reading Specialist',
            'S - Teacher - World Language Temporary',
            'S - Teacher - Performing Arts',
            'S - Teacher - Physical Therapist',
            'S - Teacher - Special Education - Wilson',
            'S - Teacher - Long Term Sub Psychologist',
            'S - Teacher - Special Education Team Chair',
            'S - Teacher - Long Term Sub Sp Ed',
            'S - Teacher - FMLA Sub Classroom',
            'S - Teacher - Long Term Sub Physical Education',
            'S - Teacher - FMLA Sub World Language',
            'S - Teacher - ELL Coach',
            'S - Teacher - Long Term Sub Classroom',
            'S - Teacher - Long Term Sub World Language',
            'S - Teacher - Classroom',
            'S - Teacher - Psychologist',
            'S - Teacher - Special Education',
            'S - Teacher - Math Specialist',
            'S - Teacher - Visual Arts',
            'S - Teacher - ELL'
        ]

        if TEACHER_CLASSROOM:
            teachers = dict()
            for row in data:
                name = row['Name']
                salary = row['Amount']
                description = row['Description']
                hire_year = int(row['Hire Date'][-4:])
                if description == 'S - Teacher - Classroom':
                    if teachers.get(name) is None:
                        teachers[name] ={ 'salary': salary, 'year': hire_year }
                    else:
                        # assume multiple entries should have the same hire date
                        teachers[name]['salary'] += salary

            X = []
            Y = []
            for teacher in teachers:
                data = teachers[teacher]
                year = data['year']
                salary = data['salary']

                # indicates they work part time or something of the sort
                if salary < 50841:
                    #print(teacher)
                    pass
                else:
                    X.append(year)
                    Y.append(salary)

                # print(f'{teacher:<30}\t{year}\t${salary:.2f}')

            plt.style.use('seaborn')
            fig, ax = plt.subplots()
            ax.scatter(X, Y)
            ax.set_xlabel('First Year of Employment')
            ax.set_ylabel('Gross Salary')
            ax.set_xlim(1970, 2020)
            ax.set_ylim(50000, 110000)
            ax.set_title('First Year of Employment vs. Gross Salary')
            formatter = ticker.FormatStrFormatter('$%1.2f')
            ax.yaxis.set_major_formatter(formatter)
            fig.show()


def money_to_float(money):
    return float(''.join(money[1:].split(',')))


if __name__ == '__main__':
    # analyze demographics info
    if DEMOGRAPHICS:
        demographics()
    if POSITIONS_AND_PAY:
        positions_and_pay()
