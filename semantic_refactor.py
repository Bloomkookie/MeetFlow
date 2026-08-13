import glob

replacements = {
    # Backgrounds
    "bg-gray-50": "bg-secondary",
    "bg-gray-100": "bg-secondary",
    "bg-slate-50": "bg-secondary",
    "bg-slate-100": "bg-secondary",
    "bg-white": "bg-card",
    "dark:bg-gray-900": "dark:bg-background",
    "dark:bg-slate-900": "dark:bg-background",
    "dark:bg-gray-800": "dark:bg-card",
    "dark:bg-slate-800": "dark:bg-card",
    
    # Text
    "text-gray-900": "text-foreground",
    "text-slate-900": "text-foreground",
    "text-gray-800": "text-foreground",
    "text-slate-800": "text-foreground",
    "text-gray-500": "text-muted-foreground",
    "text-slate-500": "text-muted-foreground",
    "text-gray-400": "text-muted-foreground",
    "text-slate-400": "text-muted-foreground",
    "dark:text-white": "dark:text-foreground",
    "dark:text-gray-300": "dark:text-secondary-foreground",
    "dark:text-gray-400": "dark:text-muted-foreground",
    "dark:text-slate-300": "dark:text-secondary-foreground",
    "dark:text-slate-400": "dark:text-muted-foreground",
    
    # Borders
    "border-gray-200": "border-border",
    "border-slate-200": "border-border",
    "dark:border-gray-800": "dark:border-border",
    "dark:border-gray-700": "dark:border-border-strong",
    "dark:border-slate-800": "dark:border-border",
    "dark:border-slate-700": "dark:border-border-strong",
    
    # Primary button stuff
    "bg-[#0B5CFF]": "bg-primary",
    "text-[#0B5CFF]": "text-primary",
    "bg-blue-600": "bg-primary",
    "bg-blue-500": "bg-primary",
    "hover:bg-blue-700": "hover:bg-primary-hover",
    "hover:bg-blue-600": "hover:bg-primary-hover",
    "hover:text-[#0B5CFF]": "hover:text-primary",
    
    # Hover background states
    "hover:bg-gray-50": "hover:bg-secondary",
    "hover:bg-slate-50": "hover:bg-secondary",
    "dark:hover:bg-gray-800": "dark:hover:bg-card",
    "dark:hover:bg-slate-800": "dark:hover:bg-card",
    "dark:hover:bg-gray-700": "dark:hover:bg-muted",
    "dark:hover:bg-slate-700": "dark:hover:bg-muted",
    
    # Avoid replacing Tailwind primitives if they might break, but we're moving fully semantic
}

for filepath in glob.glob("frontend/**/*.tsx", recursive=True):
    with open(filepath, 'r') as f:
        content = f.read()
    
    for old, new in replacements.items():
        content = content.replace(old, new)
        
    with open(filepath, 'w') as f:
        f.write(content)
