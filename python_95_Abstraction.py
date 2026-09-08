from abc import ABC, abstractmethod

class Father(ABC):
    def __init__(self,name):
        self.name=name
        print('Father Details')

    @abstractmethod
    def Loan(self):
        pass

class Son(Father):
    def Loan(self):
        print('Give back the Loan')

s=Son("Daiwik")
s.Loan()