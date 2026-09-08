class BaseTest:
    def __init__(self,browser):
        self.browser=browser

    def setup(self):
        print(f'launching the browser {self.browser}')

class loginTest(BaseTest):
    def run_test(self):
        self.setup()
        print('Basetest function called in logintest')

class signupTest(BaseTest):
    def sign_test(self):
        self.setup()
        print('Basetest function called in signupTest')

t=loginTest('chrome')
t.run_test()

t=signupTest('Firefox')
t.sign_test()

