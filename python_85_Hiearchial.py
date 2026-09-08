class School:
    def schooldetails(self):
        print('SchoolDetails provided')

class College(School):
    def college_details(self):
        print('CollegeDetails Provided')


class Degree(College):
    def Degree_Details(self):
        print('DegreeDetails provided')


College().schooldetails()
College().college_details()
Degree().Degree_Details()
Degree().college_details()