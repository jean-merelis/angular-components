import { NgClass } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EmbeddedViewRef,
    inject,
    Input,
    OnChanges,
    SecurityContext,
    SimpleChanges,
    TemplateRef,
    ViewChild,
    ViewContainerRef,
    ViewEncapsulation,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { HighlightService } from "./highlight.service";

@Component({
    selector: 'textarea[highlight]',
    templateUrl: './highlight.component.html',
    styleUrls: ['./highlight.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgClass],
})
export class HighlightComponent implements OnChanges, AfterViewInit {
    private _service = inject(HighlightService);
    private _domSanitizer = inject(DomSanitizer);
    private _elementRef = inject(ElementRef);
    private _viewContainerRef = inject(ViewContainerRef);

    @Input() code?: string;
    @Input() lang!: string;
    @ViewChild(TemplateRef) templateRef?: TemplateRef<any>;

    highlightedCode: any;
    private _viewRef?: EmbeddedViewRef<any> | null;

    ngOnChanges(changes: SimpleChanges): void {
        if ('code' in changes || 'lang' in changes) {
            if (!this._viewContainerRef.length) {
                return;
            }
            this._highlightAndInsert();
        }
    }

    ngAfterViewInit(): void {
        if (!this.lang) {
            return;
        }
        if (!this.code) {
            this.code = this._elementRef.nativeElement.value;
        }
        this._highlightAndInsert();
    }

    private _highlightAndInsert(): void {
        if (!this.templateRef) {
            return;
        }
        if (!this.code || !this.lang) {
            return;
        }
        if (this._viewRef) {
            this._viewRef.destroy();
            this._viewRef = null;
        }
        this.highlightedCode = this._domSanitizer.sanitize(
            SecurityContext.HTML,
            this._service.highlight(this.code, this.lang)
        );
        if (this.highlightedCode === null) {
            return;
        }
        this._viewRef = this._viewContainerRef.createEmbeddedView(
            this.templateRef,
            {
                highlightedCode: this.highlightedCode,
                lang: this.lang,
            }
        );
        this._viewRef.detectChanges();
    }
}
