import os
from docx import Document

print(os.getcwd())
full_path = os.path.join(os.getcwd(),'C:\\Users\\User\\Documents\\Claude\\ClaudeMasterClass\\PlaywrightRepo\\PythonforAI\\Troubleshooting n8n and langflow.docx')
print(full_path)

document = Document(full_path)
print('\n'.join(paragraph.text for paragraph in document.paragraphs))