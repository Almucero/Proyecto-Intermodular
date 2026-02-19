import { SecurityContext } from '@angular/core';
import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'markdown',
  standalone: true,
})
export class MarkdownPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string): string {
    if (!value) return '';

    let html = value;

    html = html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    html = html.replace(
      /\[(.*?)\]\((.*?)\)/g,
      (_: string, text: string, url: string) => {
        const u = url.trim().replace(/"/g, '&quot;');
        const allowed =
          u.startsWith('http://') || u.startsWith('https://') || u.startsWith('/');
        const href = allowed ? u : '#';
        return `<a href="${href}" class="text-cyan-400 hover:text-cyan-300 underline font-bold cursor-pointer" rel="noopener noreferrer" target="_blank">${text}</a>`;
      },
    );

    html = html.replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="text-cyan-300 font-bold">$1</strong>',
    );

    html = html.replace(
      /__(.*?)__/g,
      '<strong class="text-cyan-300 font-bold">$1</strong>',
    );

    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    const lines = html.split('\n');
    let inList = false;
    let newHtml = '';

    lines.forEach((line, index) => {
      let trimmed = line.trim();

      if (
        trimmed.startsWith('* ') ||
        trimmed.startsWith('- ') ||
        trimmed.startsWith('• ')
      ) {
        if (!inList) {
          newHtml += '<ul class="list-disc pl-5 mb-2 space-y-1">';
          inList = true;
        }
        const content = trimmed.substring(2);
        newHtml += `<li>${content}</li>`;
      } else {
        if (inList) {
          newHtml += '</ul>';
          inList = false;
        }

        if (trimmed.length > 0) {
          newHtml += `<p class="mb-1">${line}</p>`;
        }
      }
    });

    if (inList) newHtml += '</ul>';

    return this.sanitizer.sanitize(SecurityContext.HTML, newHtml) ?? '';
  }
}
