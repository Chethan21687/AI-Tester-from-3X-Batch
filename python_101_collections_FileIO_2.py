from dotenv import load_dotenv
import os

load_dotenv()  # Load environment variables from .env file

print(os.getenv('DB_PASSWORD'))

if os.getenv('DB_PASSWORD') == 'SUPERSECRET123!':
    print('Welcome to Admin')

else:
    print('Access Denied')