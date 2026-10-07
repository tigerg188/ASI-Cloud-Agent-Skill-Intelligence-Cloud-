import { TaskArtifact, ExportFormat } from '../types/asi';

export function exportArtifactToFile(artifact: TaskArtifact, format: ExportFormat, fileNamePrefix?: string) {
  const safeName = (fileNamePrefix || artifact.title)
    .replace(/[^a-zA-Z0-9_\u4e00-\u9fa5]/g, '_')
    .toLowerCase();

  let mimeType = 'text/plain;charset=utf-8';
  let extension = 'txt';
  let fileContent: string | Blob = '';

  switch (format) {
    case 'MD':
      mimeType = 'text/markdown;charset=utf-8';
      extension = 'md';
      fileContent = `# ${artifact.title}\n\n**创建时间**: ${new Date(artifact.createdAt).toLocaleString()}\n**指纹 Hash**: \`${artifact.evidenceHash}\` \n\n---\n\n${artifact.fullContentMarkdown}`;
      break;

    case 'TXT':
      mimeType = 'text/plain;charset=utf-8';
      extension = 'txt';
      fileContent = `${artifact.title}\n===============================\n创建时间: ${new Date(artifact.createdAt).toLocaleString()}\n指纹 Hash: ${artifact.evidenceHash}\n\n${artifact.fullContentMarkdown.replace(/[#*`>]/g, '')}`;
      break;

    case 'DOC':
      mimeType = 'application/msword;charset=utf-8';
      extension = 'doc';
      const docHtml = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><title>${artifact.title}</title>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; margin: 40px; }
          h1 { color: #1a73e8; border-bottom: 2px solid #1a73e8; padding-bottom: 8px; }
          .meta { background: #f8f9fa; border: 1px solid #dadce0; padding: 12px; border-radius: 6px; margin-bottom: 20px; font-size: 13px; }
          pre { background: #f1f3f4; padding: 12px; border-radius: 4px; font-family: monospace; font-size: 12px; }
        </style>
        </head>
        <body>
          <h1>${artifact.title}</h1>
          <div className="meta">
            <p><strong>创建时间:</strong> ${new Date(artifact.createdAt).toLocaleString()}</p>
            <p><strong>防伪证据指纹 (Hash):</strong> ${artifact.evidenceHash}</p>
            <p><strong>节点成果摘要:</strong> ${artifact.summary}</p>
          </div>
          <div>${artifact.fullContentMarkdown.replace(/\n/g, '<br/>')}</div>
        </body>
        </html>
      `;
      fileContent = new Blob([docHtml], { type: mimeType });
      break;

    case 'EXCEL':
      mimeType = 'text/csv;charset=utf-8;\uFEFF'; // UTF-8 BOM for Excel
      extension = 'csv';
      const csvRows = [
        ['属性', '属性值'],
        ['成果名称', `"${artifact.title.replace(/"/g, '""')}"`],
        ['创建时间', `"${new Date(artifact.createdAt).toLocaleString()}"`],
        ['防伪指纹 Hash', `"${artifact.evidenceHash}"`],
        ['阶段类型', artifact.isFinalAggregate ? '总成果汇总' : `节点 #${artifact.nodeIndex} 独立成果`],
        ['完整内容', `"${artifact.fullContentMarkdown.replace(/"/g, '""')}"`]
      ];
      fileContent = csvRows.map(r => r.join(',')).join('\n');
      break;

    case 'PPT':
      mimeType = 'text/html;charset=utf-8';
      extension = 'html';
      const pptHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8"/>
          <title>${artifact.title} - Presentation Outline</title>
          <style>
            body { font-family: 'Google Sans', Arial, sans-serif; background: #f8f9fa; margin: 0; padding: 20px; }
            .slide { background: white; border: 1px solid #dadce0; border-radius: 12px; width: 800px; height: 450px; margin: 20px auto; padding: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); box-sizing: border-box; display: flex; flex-col; justify-content: space-between; }
            .slide-title { color: #1a73e8; font-size: 24px; font-weight: bold; border-bottom: 2px solid #e8f0fe; padding-bottom: 12px; }
            .slide-body { color: #3c4043; font-size: 16px; line-height: 1.6; overflow-y: auto; flex: 1; margin-top: 16px; }
            .footer { font-size: 12px; color: #70757a; display: flex; justify-content: space-between; border-top: 1px solid #f1f3f4; pt: 8px; }
          </style>
        </head>
        <body>
          <div className="slide">
            <div className="slide-title">${artifact.title}</div>
            <div className="slide-body">
              <p><strong>摘要:</strong> ${artifact.summary}</p>
              <p><strong>创建时间:</strong> ${new Date(artifact.createdAt).toLocaleString()}</p>
              <p><strong>证据指纹:</strong> ${artifact.evidenceHash}</p>
            </div>
            <div className="footer">
              <span>ASI-Cloud Presentation Slide 1</span>
              <span>Google AI Studio Build</span>
            </div>
          </div>

          <div className="slide">
            <div className="slide-title">节点核心内容与推导证据</div>
            <div className="slide-body">
              <pre style="white-space: pre-wrap; font-size: 13px;">${artifact.fullContentMarkdown}</pre>
            </div>
            <div className="footer">
              <span>ASI-Cloud Presentation Slide 2</span>
              <span>Google AI Studio Build</span>
            </div>
          </div>
        </body>
        </html>
      `;
      fileContent = new Blob([pptHtml], { type: mimeType });
      break;

    case 'PDF':
      // Print-optimized HTML Blob that triggers print-to-pdf seamlessly
      mimeType = 'text/html;charset=utf-8';
      extension = 'html';
      const pdfHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8"/>
          <title>${artifact.title} (PDF Report)</title>
          <style>
            @media print { body { margin: 0; } }
            body { font-family: sans-serif; padding: 30px; color: #202124; line-height: 1.6; }
            h1 { color: #1a73e8; border-bottom: 2px solid #1a73e8; padding-bottom: 8px; }
            .badge { background: #e8f0fe; color: #1a73e8; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 12px; }
            .hash { font-family: monospace; background: #f1f3f4; padding: 6px; border-radius: 4px; font-size: 11px; }
          </style>
        </head>
        <body onload="window.print()">
          <span className="badge">${artifact.isFinalAggregate ? '总成果汇总' : '阶段节点成果'}</span>
          <h1>${artifact.title}</h1>
          <p><strong>创建时间:</strong> ${new Date(artifact.createdAt).toLocaleString()}</p>
          <p className="hash">证据指纹 Hash: ${artifact.evidenceHash}</p>
          <hr/>
          <div>${artifact.fullContentMarkdown.replace(/\n/g, '<br/>')}</div>
        </body>
        </html>
      `;
      fileContent = new Blob([pdfHtml], { type: mimeType });
      break;

    case 'JSON':
      mimeType = 'application/json;charset=utf-8';
      extension = 'json';
      fileContent = JSON.stringify(artifact, null, 2);
      break;
  }

  const blob = typeof fileContent === 'string' ? new Blob([fileContent], { type: mimeType }) : fileContent;
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${safeName}_${Date.now()}.${extension}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
