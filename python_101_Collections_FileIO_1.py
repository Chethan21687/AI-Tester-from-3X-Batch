import os
from docx import Document

file_path = os.path.join(os.getcwd(), 'Troubleshooting n8n and langflow.docx')
document = Document(file_path)
print('\n'.join(paragraph.text for paragraph in document.paragraphs))

