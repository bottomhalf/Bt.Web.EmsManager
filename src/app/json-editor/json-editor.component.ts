import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { ErrorToast, HideModal, ShowModal, Toast } from '../services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-json-editor',
  standalone: true,
  imports: [FormsModule, CommonModule, NgbTooltipModule],
  templateUrl: './json-editor.component.html',
  styleUrl: './json-editor.component.scss',
  host: { class: 'd-block' },
})
export class JsonEditorComponent implements AfterViewInit, OnInit {
  @ViewChild('codeTextarea') codeTextarea!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('lineNumbers') lineNumbers!: ElementRef<HTMLDivElement>;
  @ViewChild('syntaxOverlay') syntaxOverlay!: ElementRef<HTMLDivElement>;
  lineCount = 1;
  currentLine = 1;
  currentColumn = 1;
  errorMessage = '';
  lineNumbersArray: number[] = [1];
  highlightedContent = '';
  fontSize: string = "12px";
  selectedFontSize: number = 100;
  isLoading: boolean = false;
  baseUrl: string = "";
  fileDetail: FileDetail = {
    Content: "",
    Extension: "txt",
    FileName: "",
    FileDetailId: 0,
    ParentId: 0,
    OldFileName: ""
  };
  isPageReady: boolean = false;
  private PId: number = 0;
  constructor(private http: HttpClient,
              private router: ActivatedRoute,
              private route: Router
  ) {
    this.fileDetail.FileDetailId = Number(this.router.snapshot.queryParams['Id']);
    this.PId = Number(this.router.snapshot.queryParams['PId']);
  }
  ngOnInit(): void {
    this.baseUrl = environment.baseURL;
    if (this.fileDetail.FileDetailId > 0) {
      this.readContent();
    } else {
      this.isPageReady = true;
    }
  }

  ngAfterViewInit() {
    this.updateEditor();
  }

  onContentChange() {
    this.updateEditor();
    this.validateSyntax();
    this.updateSyntaxHighlighting();
  }

  onLanguageChange() {
    this.validateSyntax();
    this.updateSyntaxHighlighting();
  }

  updateEditor() {
    const lines = this.fileDetail.Content.split('\n');
    this.lineCount = lines.length;
    this.lineNumbersArray = Array.from({ length: this.lineCount }, (_, i) => i + 1);
    this.updateCurrentLine();
  }

  updateCurrentLine() {
    if(this.codeTextarea != null) {
      const textarea = this.codeTextarea.nativeElement;
      const cursorPosition = textarea.selectionStart;
      const beforeCursor = this.fileDetail.Content.substring(0, cursorPosition);
      const lines = beforeCursor.split('\n');
      this.currentLine = lines.length;
      this.currentColumn = lines[lines.length - 1].length + 1;
    }
  }

  onScroll() {
    const textarea = this.codeTextarea.nativeElement;
    const lineNumbers = this.lineNumbers.nativeElement;
    const syntaxOverlay = this.syntaxOverlay.nativeElement;
    
    lineNumbers.scrollTop = textarea.scrollTop;
    syntaxOverlay.scrollTop = textarea.scrollTop;
    syntaxOverlay.scrollLeft = textarea.scrollLeft;
  }

  onKeyDown(event: KeyboardEvent) {
    const textarea = this.codeTextarea.nativeElement;
    
    // Auto-indent
    if (event.key === 'Enter') {
      event.preventDefault();
      const cursorPos = textarea.selectionStart;
      const beforeCursor = this.fileDetail.Content.substring(0, cursorPos);
      const afterCursor = this.fileDetail.Content.substring(cursorPos);
      const currentLineContent = beforeCursor.split('\n').pop() || '';
      const indent = currentLineContent.match(/^\\s*/)?.[0] || '';
      
      // Add extra indent for opening braces/brackets
      let extraIndent = '';
      if (currentLineContent.trim().endsWith('{') || currentLineContent.trim().endsWith('[')) {
        extraIndent = '  ';
      }
      
      const newContent = beforeCursor + '\n' + indent + extraIndent + afterCursor;
      this.fileDetail.Content = newContent;
      
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = cursorPos + 1 + indent.length + extraIndent.length;
        this.onContentChange();
      });
    }
    
    // Tab for indentation
    if (event.key === 'Tab') {
      event.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      if (event.shiftKey) {
        // Remove indent
        const beforeSelection = this.fileDetail.Content.substring(0, start);
        const selection = this.fileDetail.Content.substring(start, end);
        const afterSelection = this.fileDetail.Content.substring(end);
        
        const lines = selection.split('\n');
        const unindentedLines = lines.map(line => line.replace(/^  /, ''));
        const newSelection = unindentedLines.join('\n');
        
        this.fileDetail.Content = beforeSelection + newSelection + afterSelection;
        setTimeout(() => {
          textarea.selectionStart = start;
          textarea.selectionEnd = start + newSelection.length;
          this.onContentChange();
        });
      } else {
        // Add indent
        const beforeSelection = this.fileDetail.Content.substring(0, start);
        const selection = this.fileDetail.Content.substring(start, end);
        const afterSelection = this.fileDetail.Content.substring(end);
        
        if (selection.includes('\n')) {
          // Multiple lines selected
          const lines = selection.split('\n');
          const indentedLines = lines.map(line => '  ' + line);
          const newSelection = indentedLines.join('\n');
          
          this.fileDetail.Content = beforeSelection + newSelection + afterSelection;
          setTimeout(() => {
            textarea.selectionStart = start;
            textarea.selectionEnd = start + newSelection.length;
            this.onContentChange();
          });
        } else {
          // Single line or no selection
          this.fileDetail.Content = beforeSelection + '  ' + afterSelection;
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start + 2;
            this.onContentChange();
          });
        }
      }
    }
  }

  validateSyntax() {
    this.errorMessage = '';
    
    if (!this.fileDetail.Content.trim()) {
      return;
    }

    try {
      if (this.fileDetail.Extension === 'json') {
        JSON.parse(this.fileDetail.Content);
      } else if (this.fileDetail.Extension === 'xml') {
        const parser = new DOMParser();
        const doc = parser.parseFromString(this.fileDetail.Content, 'text/xml');
        const parseError = doc.querySelector('parsererror');
        if (parseError) {
          throw new Error(parseError.textContent || 'Invalid XML');
        }
      }
    } catch (error: any) {
      this.errorMessage = error.message;
    }
  }

  updateSyntaxHighlighting() {
    if (this.fileDetail.Extension === 'json') {
      this.highlightedContent = this.highlightJSON(this.fileDetail.Content);
    } else {
      this.highlightedContent = this.highlightXML(this.fileDetail.Content);
    }
  }

  highlightJSON(code: string): string {
    return code
      .replace(/(".*?")\s*:/g, '<span class="json-key">$1</span>:')
      .replace(/:\s*(".*?")/g, ': <span class="json-string">$1</span>')
      .replace(/:\s*(true|false)/g, ': <span class="json-boolean">$1</span>')
      .replace(/:\s*(null)/g, ': <span class="json-null">$1</span>')
      .replace(/:\s*(-?\d+\.?\d*)/g, ': <span class="json-number">$1</span>')
      .replace(/([{}\\[\\],])/g, '<span class="json-punctuation">$1</span>');
  }

  highlightXML(code: string): string {
  return code
    .replace(/<!--[\s\S]*?-->/g, '<span class="xml-comment">$&</span>')
    .replace(/<\/?[^>]+>/g, match => {
      return match
        .replace(/(<\/?)(\w+)/, '$1<span class="xml-tag">$2</span>')
        .replace(/(\w+)=/g, '<span class="xml-attribute">$1</span>=')
        .replace(/="([^"]*)"/g, '=<span class="xml-string">"$1"</span>');
    });
  }

  formatCode() {
    try {
      if (this.fileDetail.Extension === 'json') {
        const parsed = JSON.parse(this.fileDetail.Content);
        this.fileDetail.Content = JSON.stringify(parsed, null, 2);
      } else if (this.fileDetail.Extension === 'xml') {
        this.fileDetail.Content = this.formatXML(this.fileDetail.Content);
      }
      this.onContentChange();
    } catch (error) {
      // If parsing fails, don't format
    }
  }

  formatXML(xml: string): string {
    let formatted = '';
    let indent = 0;
    const tab = '  ';
    
    xml.split(/></).forEach((node, index) => {
      if (index > 0) {
        node = '<' + node;
      }
      if (index < xml.split(/></).length - 1) {
        node = node + '>';
      }
      
      if (node.match(/^<\w[^>]*[^/]>.*<\/\w+>$/)) {
        // Self-contained tag
        formatted += tab.repeat(indent) + node + '\n';
      } else if (node.match(/^<\\w/)) {
        // Opening tag
        formatted += tab.repeat(indent++) + node + '\n';
      } else if (node.match(/^</)) {
        // Closing tag
        formatted += tab.repeat(--indent) + node + '\n';
      } else {
        // Content
        formatted += tab.repeat(indent) + node + '\n';
      }
    });
    
    return formatted.trim();
  }

  copyToClipboard() {
    navigator.clipboard.writeText(this.fileDetail.Content).then(() => {
      // Could add a toast notification here
    });
  }

  onFontSizeChange() {
     const currentSize = Math.round(12 * this.selectedFontSize / 100);
    this.fontSize = `${currentSize}px`
  }

  saveContent() {
    if (this.fileDetail.Content && this.fileDetail.FileName) {
      this.isLoading = true;
      this.fileDetail.ParentId = this.PId;
      this.http.post(this.baseUrl + "FileDetail/saveFileDetail", this.fileDetail).subscribe({
        next: (res: any) => {
          Toast("Save successfully");
          HideModal("fileNameModal");
          this.route.navigate(["/ems/filelist"])
        },
        error: error => {
          ErrorToast(error.error.ResponseBody);
        }
      })
    }
  }

  readContent() {
    this.isPageReady = false;
    this.http.get(this.baseUrl + `FileDetail/readFile/${this.fileDetail.FileDetailId}/${this.PId}`).subscribe({
      next: (res: any) => {
        this.fileDetail = res.responseBody;
        this.isPageReady = true;
        this.updateEditor();
        Toast("Data loaded successfully");
      },
      error: error => {
        ErrorToast(error.error.ResponseBody);
        this.isPageReady = true;
      }
    })
  }

  showFileNamePopup() {
    if (this.fileDetail.FileName && this.fileDetail.FileDetailId > 0) {
      this.fileDetail.OldFileName = this.fileDetail.FileName;
    }

    if (this.fileDetail.FileDetailId == 0)
      this.fileDetail.FileName = "";

    ShowModal("fileNameModal");
  }

  navToFileList() {
    this.route.navigate(["/ems/filelist"]);
  }
}


export interface FileDetail {
  FileDetailId: number;
  Content: string;
  Extension: string;
  FileName: string;
  ParentId: number;
  OldFileName: string;
  CreatedBy?: number;
  CreatedOn?: Date;
  Paths?: string;
}