from abc import ABC,abstractmethod

class Hospital(ABC):
    def __init__(self,name):
        self.name=name


class patient_details(Hospital):
    @abstractmethod
    def patient_firstname(self):
        pass

class patient_demographics(Hospital):
    @abstractmethod
    def patient_demographics(self):
        pass

class patient_Report(Hospital):
    @abstractmethod
    def patient_demographics(self):
        pass

class new_patient(Hospital):

    def patient_details(self):
        print('Print the Patient Details')

    def patient_demographics(self):
        print('Print the Patient Demographics')

    def patient_Report(self):
        print('Print the Patient Report')


c1=new_patient('Chethan')
c1.patient_details()
c1.patient_demographics()
c1.patient_Report()