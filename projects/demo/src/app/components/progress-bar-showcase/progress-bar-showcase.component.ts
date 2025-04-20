import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MerProgressBar } from '@merelis/angular/progress-bar';

@Component({
    selector: 'app-progress-bar-showcase',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MerProgressBar
    ],
    templateUrl: './progress-bar-showcase.component.html',
    styleUrls: ['./progress-bar-showcase.component.scss']
})
export class ProgressBarShowcaseComponent {
    progressValue = 0.5;
    isIndeterminate = false;

    // For the demo download simulation
    downloadProgress = 0;
    isDownloading = false;

    startDownload() {
        if (this.isDownloading) return;

        this.isDownloading = true;
        this.downloadProgress = 0;

        const interval = setInterval(() => {
            this.downloadProgress += 0.1;

            if (this.downloadProgress >= 1) {
                clearInterval(interval);
                this.isDownloading = false;
                this.downloadProgress = 1;

                // Reset after a moment for demo purposes
                setTimeout(() => {
                    this.downloadProgress = 0;
                }, 2000);
            }
        }, 500);
    }
}
