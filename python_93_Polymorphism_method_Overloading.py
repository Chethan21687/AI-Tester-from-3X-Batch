class Testsuite:
    def info(self):
        print('Run the Testsuite')

class Basesuite(Testsuite):
   def setup(self):
        print("Base setup")

   def run(self):
        print("Base test execution")

class Loginsuite(Testsuite):
    def run(self):  # overriding
        print("Login test execution")

class APITest(Basesuite):
    def run(self):  # overriding
        print("API test execution")


#t=Testsuite()
t=Basesuite()
l=Loginsuite()
a=APITest()
t.run()