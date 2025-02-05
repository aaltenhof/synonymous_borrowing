import os
import json

def create_index_files(base_path='stimuli'):
    # Walk through all directories in the stimuli folder
    for root, dirs, files in os.walk(base_path):
        # Filter for PNG files only
        png_files = [f for f in files if f.endswith('.png')]
        
        if png_files:  # Only create index if there are PNG files
            # Create index.json in the current directory
            index_path = os.path.join(root, 'index.json')
            with open(index_path, 'w') as f:
                json.dump(png_files, f, indent=2)
            print(f'Created index.json in {root}')

if __name__ == '__main__':
    create_index_files()