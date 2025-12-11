import os
import re

# Directory containing HTML files
directory = "/Users/imageactions/Downloads/bluehope_landing_page_implementation_7k8s5t_dualiteproject"

# New Search HTML to replace the Contact Button
search_html = """
      <!-- Search Toggle -->
      <div class="relative flex items-center">
        <button id="globalSearchToggle" class="text-white hover:text-blue-200 transition-colors p-2" aria-label="Rechercher">
          <i data-lucide="search" class="w-5 h-5"></i>
        </button>
        <input type="text" id="globalSearchInput" class="hidden absolute right-0 top-full mt-2 w-64 bg-white text-gray-900 rounded-lg px-4 py-2 shadow-xl outline-none transition-all duration-300 z-50" placeholder="Rechercher..." autocomplete="off">
        <div id="globalSearchSuggestions" class="absolute right-0 top-[calc(100%+3.5rem)] w-64 bg-white text-gray-900 rounded-lg shadow-xl overflow-hidden hidden z-50"></div>
      </div>
"""

# Contact Link to add to the menu
contact_link_html = """
      <div class="group relative cursor-pointer flex items-center gap-1 hover:text-white transition-colors">
        <a href="contact.html" data-i18n="btn_contact">Contact</a>
      </div>
"""

def update_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Remove Hashtag
    # Pattern: <span ...>#protégeonsnosoceans</span>
    # We'll use a regex that matches the span containing the hashtag
    content = re.sub(r'<span[^>]*data-i18n="hashtag"[^>]*>#protégeonsnosoceans</span>', '', content)
    # Also try without data-i18n just in case
    content = re.sub(r'<span[^>]*>#protégeonsnosoceans</span>', '', content)

    # 2. Add Contact Link to Menu
    # Find the closing div of the "Actu & Media" group and insert after it.
    # The structure is:
    # <div class="group relative ..."> ... Actu & Media ... </div>
    # We look for the "Actu & Media" text or data-i18n, then find the closing </div> of that group.
    
    # This is tricky with regex. Let's look for the specific block.
    # We know the Actu & Media block ends with </div>.
    # And it's followed by </div> which closes the main menu container.
    
    # Let's try to find the "Actu & Media" block and append the contact link after it.
    # We can search for the "Actu & Media" label, then find the next </div> that closes its group.
    
    # Alternative: The menu container ends with `</div>`. We can insert before the last `</div>` of the menu container.
    # The menu container starts with `<div class="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-200">`
    
    if 'data-i18n="nav_news_main"' in content:
        # Find the Actu & Media block
        pattern = r'(<div class="group relative.*?data-i18n="nav_news_main".*?</div>\s*</div>)'
        # This regex is too simple for nested divs.
        
        # Let's use a simpler approach: Replace the specific string that closes the Actu & Media group
        # The Actu & Media group looks like:
        # <div class="group relative ..."> ... <span ...>Actu & Media</span> ... </div>
        
        # Actually, let's just insert it before the closing of the main menu container.
        # The main menu container is `<div class="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-200">`
        # It ends before `<!-- KIDS Button -->` or `<div class="flex items-center gap-4">`
        
        # Let's find the end of the menu container.
        # It seems to be followed by `<!-- KIDS Button -->` or just `</div>` then `<div class="flex items-center gap-4">`
        
        # Let's try to insert after the Actu & Media block.
        # We can match the Actu & Media block by its content.
        
        # Let's look for the line `data-i18n="nav_news_main"` and then the closing `</div>` of that block.
        # Since indentation is consistent, we can rely on that somewhat.
        # The block ends with `      </div>` (6 spaces) usually.
        
        # Let's try to simply replace the closing of the Actu & Media div with Closing + Contact Link.
        # The Actu & Media div has `data-i18n="nav_news_main"`.
        # It is inside a `div` with class `group relative`.
        
        # Let's try to find the whole block for Actu & Media.
        # It starts with `<div class="group relative` and contains `nav_news_main`.
        # It ends with `</div>`.
        
        # Let's just append it to the end of the menu container.
        # The menu container is the one with `space-x-8`.
        # We can replace `</div>` that closes `space-x-8` div.
        # But there are many `</div>`.
        
        # Let's look for `<!-- KIDS Button -->` which is right after the menu container in index.html
        if '<!-- KIDS Button -->' in content:
            content = content.replace('<!-- KIDS Button -->', contact_link_html + '\n    <!-- KIDS Button -->')
        else:
            # Fallback: Look for the div that follows the menu
            # <div class="flex items-center gap-4">
            content = content.replace('<div class="flex items-center gap-4">', '</div>\n    <div class="flex items-center gap-4">') 
            # Wait, this is dangerous. We need to be inside the previous div.
            
            # Let's try to replace the specific Actu & Media block end.
            # In the file content I saw:
            #       <div class="group relative ...">
            #         <span data-i18n="nav_news_main">Actu & Media</span>
            #         ...
            #       </div>
            #     </div>
            
            # The last `</div>` closes the menu container.
            # So if we find `nav_news_main`...
            pass

    # Let's use a more robust replacement for the Contact Link.
    # We want to add it after the "Actu & Media" dropdown.
    # In all files, the menu structure should be similar.
    # We can search for the "Actu & Media" text and the following `</div>`s.
    # The "Actu & Media" block ends with `</div>`.
    # We want to insert `contact_link_html` after that block.
    
    # Let's try to replace the closing tag of the menu container.
    # The menu container starts with `class="hidden md:flex items-center space-x-8`.
    # We can find where this div ends.
    # It ends before `<div class="flex items-center gap-4">`.
    
    # So we can replace:
    # `    </div>`
    # `    <div class="flex items-center gap-4">`
    # with:
    # `      ` + contact_link_html
    # `    </div>`
    # `    <div class="flex items-center gap-4">`
    
    # Let's try to match the sequence of lines.
    pattern_menu_end = r'(\s*)</div>\s*<div class="flex items-center gap-4">'
    replacement_menu_end = r'\1' + contact_link_html + r'\1</div>\n\1<div class="flex items-center gap-4">'
    
    # But wait, in index.html there is `<!-- KIDS Button -->` between them.
    # In wao.html there is `<!-- KIDS Button -->` too.
    
    pattern_kids = r'(\s*)<!-- KIDS Button -->\s*</div>\s*<div class="flex items-center gap-4">'
    # In index.html:
    #     <!-- KIDS Button -->
    # 
    #     </div>
    # 
    #     <div class="flex items-center gap-4">
    
    # Let's try to insert the contact link before `<!-- KIDS Button -->` if it exists.
    if '<!-- KIDS Button -->' in content:
        content = content.replace('<!-- KIDS Button -->', contact_link_html + '\n    <!-- KIDS Button -->')
    
    # 3. Remove Contact Button and Add Search
    # Find: <a href="contact.html" id="contact-btn" ... > ... </a>
    # Replace with: search_html
    
    # Regex for the contact button
    contact_btn_pattern = r'<a href="contact\.html" id="contact-btn".*?</a>'
    content = re.sub(contact_btn_pattern, search_html, content, flags=re.DOTALL)

    # 4. Add Script
    if 'assets/js/search.js' not in content:
        content = content.replace('</body>', '  <script src="assets/js/search.js"></script>\n</body>')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated {filepath}")

# Iterate over all HTML files
for filename in os.listdir(directory):
    if filename.endswith(".html"):
        filepath = os.path.join(directory, filename)
        update_file(filepath)
