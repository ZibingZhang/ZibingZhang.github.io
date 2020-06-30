data = '''
'''

import csv, re
with open('.tsv', 'w', newline='') as f:
    writer = csv.writer(f, delimiter='\t', quoting=csv.QUOTE_NONE) 
    
    data = re.split('[(\t+\n*)(\n+\t*)]', data)
    data = list(filter(lambda line: line != '', data))

    name_col = data[0]
    prim_job_title_col = data[1]
    gross_comp_col = data[2]
    total_row = data[3]
    total_amount = data[4]

    writer.writerow((name_col, prim_job_title_col, gross_comp_col))
    writer.writerow((total_row, '', total_amount))

    assert((len(data) - 5)/3 == (len(data) - 5)//3)
    rows = []
    for i in range((len(data) - 5)//3):
        rows.append((data[5+3*i], data[5+3*i + 1], data[5+3*i + 2]))

    for row in rows:
        writer.writerow(row)
