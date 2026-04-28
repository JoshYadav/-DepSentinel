import re

def normalize_package_name(name):
    """Lowercases and replaces underscores/dashes with hyphens (PyPI canonical form)."""
    return re.sub(r'[-_.]+', '-', name).lower()

def parse_requirements(text):
    """
    Parses raw requirements.txt content as a string.
    Handles ==, >=, <=, ~=, and != version specifiers.
    Ignores comments and blank lines.
    Returns a list of dicts: [{name, version, specifier, raw_line}]
    """
    packages = []
    
    # Split text into lines
    lines = text.splitlines()
    
    for line in lines:
        original_line = line
        line = line.strip()
        
        # Ignore comments and blank lines
        if not line or line.startswith('#'):
            continue
            
        # Strip inline comments
        if ' #' in line:
            line = line.split(' #')[0].strip()
            
        # Regex to match package name, specifier, and version
        # e.g., requests>=2.25.1
        match = re.match(r'^([a-zA-Z0-9\-_.]+)(?:([>=<~!]=)(.*))?$', line)
        
        if match:
            name, specifier, version = match.groups()
            
            # Use default specifier and version if not provided, though not strictly in spec
            if not specifier:
                 specifier = "=="
                 version = "latest"
                 
            packages.append({
                'name': name.strip(),
                'version': version.strip(),
                'specifier': specifier,
                'raw_line': original_line
            })
            
    return packages
