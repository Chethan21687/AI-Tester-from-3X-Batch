class Mathclass:
    def add(self,a,b):
        return a+b 

    def add(self,a,b,c=10):
        return a+b+c

m=Mathclass()
print(m.add(3,4))
print(m.add(12.5,12.5))