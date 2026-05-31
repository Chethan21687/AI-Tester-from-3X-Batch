import re
from dataclasses import dataclass

USERNAME_PATTERN = re.compile(r'^[a-zA-Z0-9_]{3,20}$')
PASSWORD_PATTERN = re.compile(r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$')


@dataclass
class LoginInput:
    username: str
    password: str


@dataclass
class LoginResult:
    status: str
    username_error: str | None
    password_error: str | None


def validate_username(username: str) -> tuple[bool, str]:
    if not username:
        return False, "Username cannot be empty."
    if not USERNAME_PATTERN.match(username):
        return False, "Username must be 3-20 characters: letters, digits, or underscores only."
    return True, "Valid"


def validate_password(password: str) -> tuple[bool, str]:
    if not password:
        return False, "Password cannot be empty."
    if not PASSWORD_PATTERN.match(password):
        return False, (
            "Password must be 8+ characters with uppercase, lowercase, digit, and special char (@$!%*?&)."
        )
    return True, "Valid"


def login(credentials: LoginInput) -> LoginResult:
    print(f"\n--- Login Attempt ---")
    print(f"Username : {credentials.username}")
    print(f"Password : {credentials.password}")

    u_valid, u_msg = validate_username(credentials.username)
    p_valid, p_msg = validate_password(credentials.password)

    print(f"Username Check : {'PASS' if u_valid else 'FAIL'} — {u_msg}")
    print(f"Password Check : {'PASS' if p_valid else 'FAIL'} — {p_msg}")

    if u_valid and p_valid:
        print("Login Status   : SUCCESS")
        return LoginResult(status="success", username_error=None, password_error=None)
    else:
        print("Login Status   : FAILED")
        return LoginResult(
            status="failed",
            username_error=u_msg if not u_valid else None,
            password_error=p_msg if not p_valid else None,
        )


if __name__ == "__main__":
    test_cases = [
        LoginInput("Chethan_21", "Secure@123"),      # valid
        LoginInput("ab", "Secure@123"),              # invalid username (too short)
        LoginInput("Chethan_21", "weakpass"),        # invalid password
        LoginInput("", "Secure@123"),                # empty username
        LoginInput("Chethan_21", ""),                # empty password
        LoginInput("invalid user!", "Secure@123"),   # username with spaces/special chars
        LoginInput("ValidUser1", "NoSpecial1A"),     # password missing special char
    ]

    for credentials in test_cases:
        result = login(credentials)
        print(f"Result         : {result}\n")
