#implicit type conversion
a=10
b=5.5
result = a + b
print("The result of adding an integer and a float is:", result)
print(type(result))

#Explicit type conversion

#convert str to int
x="100"
y=int(x)
print("The result of converting a string to an integer is:", y)
print(type(y))

#convert float to str
x=123
y=str(x)
print("The result of converting an integer to a string is:", y)
print(type(y))

#convert str to float
x="3.14"
y=float(x)
print("The result of converting a string to a float is:", y)
print(type(y))

#convert str to list
x="Hello,World!"
y=list(x)
print("The result of converting a string to a list is:", y)
print(type(y))

#convert to tuple
x=[1, 2, 3, 4, 5]
y=tuple(x)
print("The result of converting a list to a tuple is:", y) 
print(type(y))

#convert to set
x=[1, 2, 3, 4, 5]
y=set(x)
print("The result of converting a list to a set is:", y)
print(type(y))

