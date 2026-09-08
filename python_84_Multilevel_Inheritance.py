class Testsuite:
    def ts1(self):
        print('Testsuite1')

class Basesuite(Testsuite):
    def bs1(self):
        print('Basesuite1')

class classsuite(Basesuite):
    def cs1(self):
        self.ts1()
        self.bs1()
        print('classsuite1')


cs=classsuite()
cs.cs1()
