import requests
import tarfile
import zipfile
import os
import shutil
import tempfile
from packaging.version import Version, InvalidVersion

# Simple in-memory cache for package metadata
_metadata_cache = {}

def get_package_metadata(package_name):
    if package_name in _metadata_cache:
        return _metadata_cache[package_name]
        
    url = f"https://pypi.org/pypi/{package_name}/json"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        info = data.get('info', {})
        releases = data.get('releases', {})
        
        result = {
            'latest_version': info.get('version'),
            'all_versions': list(releases.keys()),
            'author': info.get('author'),
            'summary': info.get('summary'),
            'home_page': info.get('home_page'),
            'release_dates': {v: releases[v][0]['upload_time'] if releases[v] else None for v in releases}
        }
        _metadata_cache[package_name] = result
        return result
    except requests.RequestException as e:
        print(f"Error fetching metadata for {package_name}: {e}")
        return None

def get_all_versions(package_name):
    metadata = get_package_metadata(package_name)
    if not metadata:
        return []
        
    versions = metadata.get('all_versions', [])
    
    # Sort versions using packaging.version
    valid_versions = []
    for v in versions:
        try:
            valid_versions.append((Version(v), v))
        except InvalidVersion:
            pass
            
    valid_versions.sort(key=lambda x: x[0])
    return [v[1] for v in valid_versions]

def get_previous_version(package_name, current_version):
    versions = get_all_versions(package_name)
    if not versions:
        return None
        
    try:
        current_v = Version(current_version)
    except InvalidVersion:
        return None
        
    previous = None
    for v_str in versions:
        try:
            v = Version(v_str)
            if v < current_v:
                previous = v_str
            else:
                break
        except InvalidVersion:
            pass
            
    return previous

def download_and_extract_package(package_name, version):
    url = f"https://pypi.org/pypi/{package_name}/{version}/json"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        urls = data.get('urls', [])
        
        # Prefer sdist (.tar.gz), fallback to wheel (.whl)
        download_url = None
        is_tar = False
        is_zip = False
        
        for u in urls:
            if u.get('packagetype') == 'sdist' and u.get('url', '').endswith('.tar.gz'):
                download_url = u.get('url')
                is_tar = True
                break
                
        if not download_url:
            for u in urls:
                 if u.get('packagetype') == 'bdist_wheel' and u.get('url', '').endswith('.whl'):
                     download_url = u.get('url')
                     is_zip = True
                     break
                     
        if not download_url:
            print(f"No suitable distribution found for {package_name}=={version}")
            return None
            
        # Create temp dir
        temp_dir = tempfile.mkdtemp(prefix=f"depsentinel_{package_name}_{version}_")
        
        # Download
        archive_path = os.path.join(temp_dir, f"archive{'.tar.gz' if is_tar else '.whl'}")
        with requests.get(download_url, stream=True) as r:
            r.raise_for_status()
            with open(archive_path, 'wb') as f:
                for chunk in r.iter_content(chunk_size=8192):
                    f.write(chunk)
                    
        # Extract
        extract_dir = os.path.join(temp_dir, "extracted")
        os.makedirs(extract_dir, exist_ok=True)
        
        if is_tar:
            with tarfile.open(archive_path, "r:gz") as tar:
                tar.extractall(path=extract_dir)
        elif is_zip:
            with zipfile.ZipFile(archive_path, 'r') as zip_ref:
                zip_ref.extractall(extract_dir)
                
        # Clean up archive
        os.remove(archive_path)
        
        return extract_dir
        
    except Exception as e:
        print(f"Error downloading/extracting {package_name} v{version}: {e}")
        return None

def get_python_files(extracted_path):
    py_files = []
    for root, _, files in os.walk(extracted_path):
        for file in files:
            if file.endswith('.py'):
                py_files.append(os.path.join(root, file))
    return py_files

def cleanup_extracted_package(extracted_path):
    if extracted_path and os.path.exists(extracted_path):
        # The parent of extracted_path is the actual temp dir created by mkdtemp
        parent_dir = os.path.dirname(extracted_path)
        try:
             shutil.rmtree(parent_dir)
        except Exception as e:
             print(f"Error cleaning up {parent_dir}: {e}")
