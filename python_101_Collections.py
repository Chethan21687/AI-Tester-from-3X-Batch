from collections import *

info=namedtuple('info',['name','age','gender'])
person=info('Alice', 30, 'Female')
print(person.name)

c=Counter('abcdeabcdabcaba')
print(c.most_common(3))

from collections import defaultdict
group=defaultdict(list)
for word in ['apple','banana','grapes','kiwi','banana','kiwi']:
    group[word].append(len(word))


counts= defaultdict(int)
unique= defaultdict(set)
nested=defaultdict(lambda: defaultdict(int))
print(counts)
