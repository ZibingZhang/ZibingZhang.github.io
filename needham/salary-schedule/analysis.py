import numpy
from scipy import stats
import matplotlib.pyplot as plt
import csv
from re import sub
from decimal import Decimal

with open('Unit A 2019.tsv', 'r') as f:
    # reading in the data
    csv_reader = csv.reader(f, delimiter='\t')

    data = dict()
    headers = []
    
    for idx, row in enumerate(csv_reader):
        for header_idx, item in enumerate(row):
            if idx == 0:
                headers.append(item)
                data[headers[header_idx]] = []
            else:
                data[headers[header_idx]].append(item)

    # columns should be:
    # - STEP
    # - B.A.
    # - B+15
    # - M.A.
    # - M+15
    # - M+30
    # - M+45
    # - M+60
    # - D
    # it's assumed that salary increases with step in a linear fashion within each year

    time = list(map(int, data['STEP']))
    pay = list(map(int, data['M.A.']))

    slope, intercept, r_value, p_value, std_err = stats.linregress(time, pay)

    salary = '$106,604.65'  # AYACHE, RICHARD M
    salary = float(Decimal(sub(r'[^\d.]', '', salary)))

    years_of_service = (salary - intercept) / slope

            
