import pytest

def test_addition():
    assert 1 + 1 == 2

def test_string_concatenation():
    assert "Hello" in "Hello World"

def test_list_length():
    assert isinstance(42,int)

def zerodivision():
    with pytest.raises(ZeroDivisionError):
        1 / 0

@pytest.mark.smoke
def test_method2():
    assert 1 - 1 == 0

@pytest.mark.regression
def test_method3():
    assert 1 + 1 == 2