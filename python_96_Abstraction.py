from abc import ABC, abstractmethod

class playwright_service(ABC):
    def __init__(self,browsername):
        self.browsername=browsername

    @abstractmethod
    def service_start(self):
        pass


    def stop_service(self):
                 print('Stop the Service')
    

class playwright_batch(playwright_service):
        def service_start(self):
             print('Start the Service')

      

c=playwright_batch('chrome')
c.service_start()
c.stop_service()

