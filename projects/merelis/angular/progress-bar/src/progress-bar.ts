import { NgStyle } from "@angular/common";
import { booleanAttribute, Component, computed, input, numberAttribute, ViewEncapsulation } from "@angular/core";

@Component({
    selector: "mer-progress-bar",
    standalone: true,
    template: `
        <div class="mer-progress-bar-value" [ngStyle]="_width()"></div>
    `,
    styleUrls: ["./progress-bar.scss"],
    encapsulation: ViewEncapsulation.None,
    imports: [
        NgStyle
    ],
    host: {
        "[class.mer-progress-bar]": "true",
        "[class.mer-progress-bar-indeterminate]": "indeterminate()"
    }
})
export class MerProgressBar {
    readonly indeterminate = input(false, {transform: booleanAttribute});
    readonly value = input(0, {transform: numberAttribute})

    protected readonly _width = computed(() => {
        if (this.indeterminate()) {
            return {}
        }
        const perc = this.value() * 100;
        return {width: `${perc}%`}
    })
}
