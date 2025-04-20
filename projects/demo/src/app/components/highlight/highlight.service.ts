import { Injectable } from '@angular/core';
import hljs from 'highlight.js';

@Injectable({providedIn: 'root'})
export class HighlightService {

    highlight(code: string, language: string): string {
        code = this._format(code);
        return hljs.highlight(code, {language}).value;
    }

    private _format(code: string): string {
        let indentation = 0;
        const lines = code.split('\n');
        while (lines.length && lines[0].trim() === '') {
            lines.shift();
        }
        while (lines.length && lines[lines.length - 1].trim() === '') {
            lines.pop();
        }
        lines
            .filter((line) => line.length)
            .forEach((line, index) => {
                if (index === 0) {
                    indentation = line.search(/\S|$/);
                    return;
                }
                indentation = Math.min(line.search(/\S|$/), indentation);
            });

        return lines.map((line) => line.substring(indentation)).join('\n');
    }
}
