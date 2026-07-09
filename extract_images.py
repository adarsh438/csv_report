import fitz
import os

doc = fitz.open(r'Software Developer (Intern _ Full-Time) Assignment.pdf')
os.makedirs('screenshots', exist_ok=True)

idx = 0
for page in doc:
    for img in page.get_images(full=True):
        xref = img[0]
        pix = fitz.Pixmap(doc, xref)
        pix.save(f'screenshots/ref_{idx}.png')
        print(f'Saved ref_{idx}.png: {pix.width}x{pix.height}')
        idx += 1
