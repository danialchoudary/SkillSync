import os

env_path = '.env'
if os.path.exists(env_path):
    with open(env_path, 'rb') as f:
        content = f.read()
        print(f"Content length: {len(content)}")
        for line in content.splitlines():
            if b'EMAIL_USER' in line or b'EMAIL_PASS' in line:
                print(f"Line: {line}")
else:
    print(".env not found in current directory")
