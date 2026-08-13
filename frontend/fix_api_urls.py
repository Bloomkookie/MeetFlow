import os
import glob

def replace_in_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Simple replace
    new_content = content.replace('"http://localhost:8000/api', '`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api"}` + "')
    new_content = new_content.replace('`http://localhost:8000/api', '`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api"}')
    new_content = new_content.replace('process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"', 'process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api"')
    
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Fixed {filepath}")

for root, _, files in os.walk('frontend'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            replace_in_file(os.path.join(root, file))
