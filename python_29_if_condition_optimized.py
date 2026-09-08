age=int(input('Enter the age\n').strip())

if age<=0 or age>130:
    print('Enter the valid age')
else:
    if age<=21:
        print('age is valid')
    else:
        print('age is invalid')