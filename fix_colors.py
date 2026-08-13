import glob

replacements = {
    "text-slate-800": "text-gray-900",
    "text-slate-500": "text-gray-500",
    "bg-slate-800": "bg-gray-800",
    "bg-slate-50": "bg-gray-50",
    "bg-slate-100": "bg-gray-100",
    "border-slate-200": "border-gray-200",
    "text-slate-200": "text-gray-200",
    "dark:bg-slate-900": "dark:bg-gray-900",
    "dark:border-slate-700": "dark:border-gray-800",
    "dark:bg-slate-800": "dark:bg-gray-800",
    "dark:text-slate-400": "dark:text-gray-400",
    "dark:text-slate-300": "dark:text-gray-300",
    "dark:hover:bg-slate-800": "dark:hover:bg-gray-800",
    "dark:hover:bg-slate-700": "dark:hover:bg-gray-700",
    "dark:border-slate-600": "dark:border-gray-700",
}

for filepath in glob.glob("frontend/**/*.tsx", recursive=True):
    with open(filepath, 'r') as f:
        content = f.read()
    
    for old, new in replacements.items():
        content = content.replace(old, new)
        
    with open(filepath, 'w') as f:
        f.write(content)
