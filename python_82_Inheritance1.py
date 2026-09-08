#Single Inheritance

class Parent:
    parent_name='Alappa'
    __parent2='Rangappa'

    def parent1(self):
        self.child='Chethan'
        print(f'print the details of parent1: {self.parent_name}')

class Child(Parent):

    def child1(self):
        self.parent1()
        print(f'print the details of both parent and child :{self.parent_name} and {self.child}')


si=Child()
si.child1()


