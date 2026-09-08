class Browser:

    def make_http_request(self,url):
         print("Hi, Lets make the HTTP request without auth", url)

    def make_http_request(self, url, auth=None):
        print("Hi, Lets make the HTTP request with auth", url, auth)

b=Browser()
b.make_http_request('google.com','admin')