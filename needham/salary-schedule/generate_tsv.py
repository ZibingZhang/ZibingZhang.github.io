data = '''
'''

import csv
with open('Unit A .tsv', 'w', newline='') as f:
    writer = csv.writer(f, delimiter='\t', quoting=csv.QUOTE_NONE) 
    
    rows = data.split('\n')
    for row in rows:
        writer.writerow(row.split(' '))
    
