class Person:
    def say_hello(self,name):
        print('the name is',name)

    def say_hello(self,name,last_name='Moni'):
        print('the total name is',name,last_name)

p=Person()
p.say_hello('Daiwik')