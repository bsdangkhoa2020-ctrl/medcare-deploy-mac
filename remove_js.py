import re

with open('index.html', 'r') as f:
    content = f.read()

# Remove JS functions related to registration
# function regStep1 ... function regGoBack ... function regSubmit
# They are inside index.html <script>
content = re.sub(r'// ── REGISTER ──\n[\s\S]*?(?=// ── ADMIN: TẠO MÃ MỜI ──|// ── END REGISTER ──)', '', content)
content = re.sub(r'// ── ADMIN: TẠO MÃ MỜI ──[\s\S]*?(?=// ── LỊCH HẸN ──)', '', content)

with open('index.html', 'w') as f:
    f.write(content)
