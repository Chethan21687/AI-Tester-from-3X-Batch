class SilverPlus:
    def firstvehicle(self):
        print('1st vehicle')

class Bajaj(SilverPlus):
    def secondvehicle(self):
        print('2nd vehicle')

class Hero(Bajaj,SilverPlus):
    def thirdvehicle(self):
        self.firstvehicle()
        print('3rd Vehicle')

class Honda(Hero):
    def fourthvehicle(self):
        print('4th Vehicle')


bikes=Honda()
bikes.firstvehicle()
bikes.secondvehicle()
bikes.thirdvehicle()
bikes.fourthvehicle()

