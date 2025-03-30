import { MatTooltip } from "@angular/material/tooltip";


export class ClipboardTooltipHelper {

    copied(evt: boolean, tooltip: MatTooltip) {
        if (evt) {
            tooltip.disabled = false;
            tooltip.showDelay = 0;
            tooltip.hideDelay = 3000;
            tooltip.show();
            setTimeout(() => {
                tooltip.hide();
                tooltip.disabled = true;
            }, 2000);
        }
    }
}
