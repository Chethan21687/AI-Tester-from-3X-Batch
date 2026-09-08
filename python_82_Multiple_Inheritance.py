class ApiTest:
    def api(self):
        print('The status is 200')

class BaseTest:
    def base(self):
        print('The status is 300')


class FinalTest(BaseTest,ApiTest):
    def run(self):
        self.api()
        self.base()
        print('Multiple Inheritance follows ')

c1=FinalTest()
c1.run()

#As the Class names are different in FinalTest , it will call the functions associated with the class 