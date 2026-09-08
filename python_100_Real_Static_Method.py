class CMS():

    @staticmethod
    def client_add(name):
        print('client added',name)

class EOS():
    @staticmethod
    def client_registration(swn):
        print('Swn is',swn)


class Swiftt():
    def execute(self):
        CMS.client_add('Chethan')
        EOS.client_registration(20090012)
        print('Both methods called')

s=Swiftt()
s.execute()