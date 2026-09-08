class BaseTest:
    def run(self):
        print('Run the BaseTest')

class LoginTest(BaseTest):
    def run(self):
        print('Run LoginTest')

t=LoginTest()
t.run()