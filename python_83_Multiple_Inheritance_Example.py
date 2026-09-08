class Father1():
    def give_money(self):
        print('Father1 gave 100000 rs')

class Father2():
    def give_money(self):
        print('Father2 gave 200000 rs')

class TotalMoney(Father2,Father1):
    def collect_money(self):
        print('Total Money Collected')
        self.give_money()
        

t1=TotalMoney()
t1.collect_money()

#As the function names are identical in both the class the python takes the first class described in the
#class TotalMoney() and executes based on MRO (Method Resolution Order)

