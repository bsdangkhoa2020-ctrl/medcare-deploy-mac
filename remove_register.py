import re

with open('index.html', 'r') as f:
    content = f.read()

# 1. Remove register button in landing
content = re.sub(r'\s*<button class="btn btn-ghost" onclick="goTo\(\'s-register\'\)">Đăng ký với mã mời</button>', '', content)

# 2. Remove 'hoặc' divider and register button in login
login_divider_regex = r'\s*<div style="display:flex;align-items:center;gap:12px;margin:24px 0">\s*<div style="flex:1;height:0\.5px;background:var\(--border\)"></div>\s*<div style="font-size:11px;color:var\(--hint\);letter-spacing:\.06em">hoặc</div>\s*<div style="flex:1;height:0\.5px;background:var\(--border\)"></div>\s*</div>'
content = re.sub(login_divider_regex, '', content)

# 3. Remove s-register block
# It starts with <!-- ── REGISTER ── -->
# and ends right before <!-- ── CONSENT ── -->
content = re.sub(r'<!-- ── REGISTER ── -->[\s\S]*?(?=<!-- ── CONSENT ── -->)', '', content)

# 4. Remove Admin Invite Codes Section
# It starts with <!-- ── MÃ MỜI ── -->
# and ends right before <!-- ── CÀI ĐẶT ── -->
content = re.sub(r'<!-- ── MÃ MỜI ── -->[\s\S]*?(?=<!-- ── CÀI ĐẶT ── -->)', '', content)

with open('index.html', 'w') as f:
    f.write(content)

print("Done")
