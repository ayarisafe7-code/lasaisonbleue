import os
import re

def validate_html_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Simple stack-based parser for common block tags
    tags_to_check = ['div', 'nav', 'section', 'main', 'header', 'footer', 'ul', 'li', 'a', 'button', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']
    stack = []
    errors = []
    
    # Regex to find tags
    # This is a simplified regex and might not catch all edge cases (like tags in strings), but good for a quick audit
    tag_pattern = re.compile(r'</?(\w+)[^>]*>')
    
    lines = content.split('\n')
    for line_num, line in enumerate(lines, 1):
        matches = tag_pattern.finditer(line)
        for match in matches:
            tag_str = match.group(0)
            tag_name = match.group(1).lower()
            
            if tag_name not in tags_to_check:
                continue
                
            is_closing = tag_str.startswith('</')
            is_self_closing = tag_str.endswith('/>')
            
            if is_self_closing:
                continue
                
            if not is_closing:
                stack.append((tag_name, line_num))
            else:
                if not stack:
                    errors.append(f"Line {line_num}: Unexpected closing tag </{tag_name}>")
                else:
                    last_tag, last_line = stack[-1]
                    if last_tag == tag_name:
                        stack.pop()
                    else:
                        # Found a mismatch. 
                        # It could be that we missed a closing tag for 'last_tag' or this is a wrong closing tag.
                        # For this simple audit, we'll report the mismatch.
                        errors.append(f"Line {line_num}: Mismatched closing tag </{tag_name}>. Expected </{last_tag}> (opened at line {last_line})")
                        # Try to recover: if the current closing tag matches something deeper in the stack, pop until there.
                        # Otherwise, ignore this closing tag.
                        found_in_stack = False
                        for i in range(len(stack) - 1, -1, -1):
                            if stack[i][0] == tag_name:
                                # Found it, pop everything up to it
                                while len(stack) > i:
                                    popped_tag, popped_line = stack.pop()
                                    if popped_tag != tag_name:
                                         errors.append(f"  -> Missing closing tag for <{popped_tag}> opened at line {popped_line}")
                                found_in_stack = True
                                break
                        if not found_in_stack:
                             pass # Just ignore the extra closing tag

    for tag, line in stack:
        errors.append(f"Unclosed tag <{tag}> opened at line {line}")

    return errors

def main():
    html_files = [f for f in os.listdir('.') if f.endswith('.html')]
    
    print("HTML Validation Report")
    print("======================")
    
    has_errors = False
    for html_file in html_files:
        errors = validate_html_file(html_file)
        if errors:
            has_errors = True
            print(f"\nFile: {html_file}")
            for error in errors:
                print(f"  - {error}")
    
    if not has_errors:
        print("\nNo structural errors found in HTML files.")

if __name__ == "__main__":
    main()
