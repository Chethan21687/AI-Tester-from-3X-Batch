enter_grade=int(input('Enter the Marks\n').strip())

if enter_grade>=90 and enter_grade<=100:
    print('Grade A')

elif enter_grade>=80 and enter_grade<=89:
    print('Grade B')

elif enter_grade>=70 and enter_grade<=79:
    print('Grade C')

elif enter_grade>=60 and enter_grade<=69:
    print('Grade D')

else:
    print('Grade F')