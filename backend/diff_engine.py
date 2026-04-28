import difflib
import os
from fetcher import download_and_extract_package, get_python_files, cleanup_extracted_package

# In-memory cache: {(package_name, version): code_dict}
_code_cache = {}

def extract_package_code(package_name, version):
    """Downloads and extracts package, reading all .py files. Results are cached."""
    cache_key = (package_name, version)
    if cache_key in _code_cache:
        return _code_cache[cache_key], None  # None path = already cleaned up

    extracted_path = download_and_extract_package(package_name, version)
    if not extracted_path:
        return None, None
        
    py_files = get_python_files(extracted_path)
    
    code_dict = {}
    for file_path in py_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                rel_path = os.path.relpath(file_path, extracted_path)
                code_dict[rel_path] = f.read()
        except UnicodeDecodeError:
            pass

    # Cache it and clean up immediately
    _code_cache[cache_key] = code_dict
    cleanup_extracted_package(extracted_path)
            
    return code_dict, None


def compute_real_diff(package_name, old_version, new_version, new_code=None):
    """
    Computes unified diffs between two package versions.
    If new_code dict is provided, skip re-downloading the new version.
    """
    if new_code is None:
        new_code, _ = extract_package_code(package_name, new_version)
    
    if new_code is None:
        return None
        
    old_code = {}
    if old_version:
        old_code, _ = extract_package_code(package_name, old_version)
        if old_code is None:
            old_code = {}
            
    all_files = set(old_code.keys()).union(set(new_code.keys()))
    
    diff_result = {
        'added_lines': [],
        'removed_lines': [],
        'changed_files': [],
        'new_files': [],
        'deleted_files': [],
        'diff_by_file': {},
        'total_additions': 0,
        'total_deletions': 0
    }
    
    for filename in all_files:
        old_file_content = old_code.get(filename, "")
        new_file_content = new_code.get(filename, "")
        
        if not old_version or filename not in old_code:
             diff_result['new_files'].append(filename)
        elif filename not in new_code:
             diff_result['deleted_files'].append(filename)
        elif old_file_content != new_file_content:
             diff_result['changed_files'].append(filename)
             
        if old_file_content != new_file_content:
            old_lines = old_file_content.splitlines(keepends=True)
            new_lines = new_file_content.splitlines(keepends=True)
            
            diff = list(difflib.unified_diff(
                old_lines, new_lines,
                fromfile=f"old/{filename}", tofile=f"new/{filename}",
                n=3
            ))
            
            if diff:
                diff_str = "".join(diff)
                diff_result['diff_by_file'][filename] = diff_str
                
                for line in diff:
                    if line.startswith('---') or line.startswith('+++'):
                        continue
                    if line.startswith('+'):
                        diff_result['added_lines'].append(line[1:])
                        diff_result['total_additions'] += 1
                    elif line.startswith('-'):
                        diff_result['removed_lines'].append(line[1:])
                        diff_result['total_deletions'] += 1
        
    return diff_result

def get_diff_summary(diff_result):
    if not diff_result:
        return "Failed to compute diff."
        
    summary = f"{len(diff_result['changed_files']) + len(diff_result['new_files']) + len(diff_result['deleted_files'])} files changed, {diff_result['total_additions']} lines added, {diff_result['total_deletions']} lines removed."
    
    if diff_result['changed_files']:
        summary += f"\nModified files: {', '.join(diff_result['changed_files'][:5])}"
        if len(diff_result['changed_files']) > 5:
            summary += "..."
            
    if diff_result['new_files']:
        summary += f"\nNew files: {', '.join(diff_result['new_files'][:5])}"
        if len(diff_result['new_files']) > 5:
            summary += "..."
            
    return summary
