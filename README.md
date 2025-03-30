# Merelis Angular Components

A library of reusable Angular components and utilities that provides high-quality UI elements for your applications.

[![npm version](https://badge.fury.io/js/@merelis%2Fangular.svg)](https://badge.fury.io/js/@merelis%2Fangular)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installation

```bash
npm install @merelis/angular --save
```

## Available Components

Currently, the library provides the following components:

### MerSelectComponent

An advanced select component with filtering and typeahead capabilities. Supports single or multiple selection, full customization, reactive forms integration, and conditional rendering.

### MerProgressBar

A progress bar component that can be used independently or integrated with other components.

## Installation and Usage

### Initial Setup

After installing the package, you need to import the necessary styles in your application's `styles.scss` file:

```scss
@use '@angular/cdk/overlay-prebuilt.css';
@use '@merelis/angular/select/styles';
```
This will import both the CDK overlay styles (required for the dropdown functionality) and the component-specific styles.

Since these are standalone components, you can import them directly in your components:

#### Direct import in a component

```typescript
import { Component } from '@angular/core';
import { MerSelectComponent } from '@merelis/angular/select';
import { MerProgressBar } from '@merelis/angular/progress-bar';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [
    MerSelectComponent,
    MerProgressBar
  ],
  template: `
    <mer-select [dataSource]="items" [(value)]="selectedItem"></mer-select>
    <mer-progress-bar [value]="0.5"></mer-progress-bar>
  `
})
export class ExampleComponent {
  // ...
}
```


### MerSelectComponent

The `MerSelectComponent` offers a robust alternative to the native HTML select, with additional features like filtering and typeahead.

#### Basic HTML

```html
<mer-select 
  [dataSource]="optionsList" 
  [(value)]="selectedValue"
  [placeholder]="'Select an option'">
</mer-select>
```

#### Input Properties

| Name | Type                                    | Default | Description                                                                            |
|------|-----------------------------------------|--------|----------------------------------------------------------------------------------------|
| dataSource | Array\<T\> &#124; SelectDataSource\<T\> | undefined | List of available options for selection or data source for the component   |
| value | T \| T[] \| null                        | undefined | Currently selected value                                                               |
| loading | boolean                                 | false | Displays loading indicator using MerProgressBar                                        |
| disabled | boolean                                 | false | Disables the component                                                                 |
| readOnly | boolean                                 | false | Sets the component as read-only                                                        |
| disableSearch | boolean                                 | false | Disables text search functionality                                                     |
| disableOpeningWhenFocusedByKeyboard | boolean                                 | false | Prevents the panel from opening automatically when focused via keyboard                |
| multiple | boolean                                 | false | Allows multiple selection                                                              |
| canClear | boolean                                 | true | Allows clearing the selection                                                          |
| alwaysIncludesSelected | boolean                                 | false | Always includes the selected item in the dropdown, even if it doesn't match the filter |
| autoActiveFirstOption | boolean                                 | true | Automatically activates the first option when the panel is opened                      |
| debounceTime | number                                  | 100 | Debounce time for text input (in ms)                                                   |
| panelOffsetY | number                                  | 0 | Vertical offset of the options panel                                                   |
| compareWith | Comparable\<T\>                         | undefined | Function to compare values                                                             |
| displayWith | DisplayWith\<T\>                        | undefined | Function to display values as text                                                     |
| filterPredicate | FilterPredicate\<T\>                    | undefined | Function to filter options based on typed text                                         |
| disableOptionPredicate | OptionPredicate\<T\>                    | () => false | Function to determine which options should be disabled                                 |
| disabledOptions | T[]                                     | [] | List of options that should be disabled                                                |
| connectedTo | MerSelectPanelOrigin                    | undefined | Element to which the panel should connect                                              |
| panelClass | string \| string[]                      | undefined | CSS class(es) applied to the options panel                                             |
| panelWidth | string \| number                        | undefined | Width of the options panel                                                             |
| position | 'auto' \| 'above' \| 'below'            | 'auto' | Position of the panel relative to the input                                            |
| placeholder | string                                  | undefined | Text to display when no item is selected                                               |

#### Output Events

| Name | Description |
|------|-----------|
| opened | Emitted when the options panel is opened |
| closed | Emitted when the options panel is closed |
| focus | Emitted when the component receives focus |
| blur | Emitted when the component loses focus |
| inputChanges | Emitted when the text input value changes |

#### Complete Example

```typescript
import { Component } from '@angular/core';

interface User {
  id: number;
  name: string;
}

@Component({
  selector: 'app-example',
  template: `
    <mer-select
      [dataSource]="users"
      [(value)]="selectedUser"
      [displayWith]="displayUserName"
      [compareWith]="compareUsers"
      [placeholder]="'Select a user'"
      [loading]="isLoading"
      (opened)="onPanelOpened()"
      (closed)="onPanelClosed()"
      (inputChanges)="onInputChanged($event)">
    </mer-select>
  `
})
export class ExampleComponent {
  users: User[] = [
    { id: 1, name: 'John Smith' },
    { id: 2, name: 'Mary Johnson' },
    { id: 3, name: 'Peter Williams' }
  ];
  selectedUser: User | null = null;
  isLoading = false;

  displayUserName(user: User): string {
    return user.name;
  }

  compareUsers(user1: User, user2: User): boolean {
    return user1?.id === user2?.id;
  }

  onPanelOpened(): void {
    console.log('Options panel opened');
  }

  onPanelClosed(): void {
    console.log('Options panel closed');
  }

  onInputChanged(text: string): void {
    console.log('Search text:', text);
  }
}
```

### MerProgressBar

The `MerProgressBar` component displays a visual progress bar, useful for indicating the progress of operations.

#### Basic HTML

```html
<mer-progress-bar
  [value]="0.75"
  [indeterminate]="false">
</mer-progress-bar>
```

#### Input Properties

| Name | Type | Default | Description |
|------|------|--------|-----------|
| value | number | 0 | Current progress value (between 0 and 1) |
| indeterminate | boolean | false | Determines if the progress bar should show an indeterminate progress indicator |

#### Usage Example

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-progress-example',
  template: `
    <mer-progress-bar
      [value]="downloadProgress"
      [indeterminate]="downloadInProgress">
    </mer-progress-bar>
    
    <button (click)="startDownload()">Start Download</button>
  `
})
export class ProgressExampleComponent {
  downloadProgress = 0;
  downloadInProgress = false;

  startDownload() {
    this.downloadInProgress = true;
    
    // Simulating a download
    const interval = setInterval(() => {
      this.downloadProgress += 0.1;
      
      if (this.downloadProgress >= 1) {
        clearInterval(interval);
        this.downloadInProgress = false;
        this.downloadProgress = 1;
      }
    }, 500);
  }
}
```

## Custom Templates

The `MerSelectComponent` allows customization of the trigger (clickable area) and options through templates.

### Custom Trigger Template

```html
<mer-select [dataSource]="users" [(value)]="selectedUser">
  <ng-template merSelectTriggerDef>
    <div class="custom-trigger">
      <img *ngIf="selectedUser?.avatar" [src]="selectedUser.avatar" class="avatar">
      <span>{{ selectedUser?.name }}</span>
    </div>
  </ng-template>
</mer-select>
```

### Custom Option Template

```html
<mer-select [dataSource]="users" [(value)]="selectedUser">
  <ng-template merSelectOptionDef let-option>
    <div class="custom-option">
      <img *ngIf="option.avatar" [src]="option.avatar" class="avatar">
      <div class="user-info">
        <div class="name">{{ option.name }}</div>
        <div class="email">{{ option.email }}</div>
      </div>
    </div>
  </ng-template>
</mer-select>
```

## Integration with Angular Material
The MerSelectComponent can be integrated with Angular Material's mat-form-field component through the @merelis/angular-material package. This integration allows you to use the select component within Material's form field, benefiting from features like floating labels, hints, and error messages.

### Installation

```bash
npm install @merelis/angular-material --save
```


### Usage with mat-form-field

```typescript
import { Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MerSelectComponent } from '@merelis/angular/select';
import { provideMerMaterialIntegration } from '@merelis/angular-material';

@Component({
  selector: 'app-material-example',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MerSelectComponent
  ],
  providers: [
    provideMerMaterialIntegration() // Enable integration with Angular Material
  ],
  template: `
    <mat-form-field appearance="outline">
      <mat-label>Select a user</mat-label>
      <mer-select
        [dataSource]="users"
        [(value)]="selectedUser"
        [displayWith]="displayUserName"
        [compareWith]="compareUsers">
      </mer-select>
      <mat-hint>Select a user from the list</mat-hint>
      <mat-error>Please select a valid user</mat-error>
    </mat-form-field>
  `
})
export class MaterialExampleComponent {
  users = [
    { id: 1, name: 'John Smith' },
    { id: 2, name: 'Mary Johnson' },
    { id: 3, name: 'Peter Williams' }
  ];
  selectedUser = null;
  
  displayUserName(user: any): string {
    return user?.name || '';
  }

  compareUsers(user1: any, user2: any): boolean {
    return user1?.id === user2?.id;
  }
}
```




## Component Integration

The `MerSelectComponent` internally uses the `MerProgressBar` to display a loading indicator when the `loading` property is set to `true`.

```html
<mer-select
  [dataSource]="dataItems"
  [(value)]="selectedItem"
  [loading]="isLoadingData">
</mer-select>
```

### CSS Customization

The components can be customized using CSS variables. Below are the available variables for each component.

#### MerSelect

```scss
.mer-select {
  // Base select appearance
  --mer-select-font: system-ui, Roboto, sans-serif;
  --mer-select-font-size: 1em;
  --mer-select-font-weight: normal;
  --mer-select-line-height: 1em;
  --mer-select-letter-spacing: normal;
  --mer-select-min-height: 32px;
  --mer-select-side-padding: 8px;
  
  // Colors and states
  --mer-select-background-color: white;
  --mer-select-color: black;
  --mer-select-border: 1px solid #8c8a8a;
  
  // Focus state
  --mer-select-background-color--focused: white;
  --mer-select-color--focused: black;
  --mer-select-border--focused: 1px solid #8c8a8a;
  --mer-select-outline--focused: solid #4e95e8 2px;
  --mer-select-outline-offset--focused: -1px;
  
  // Disabled state
  --mer-select-background-color--disabled: #ececec;
  --mer-select-color--disabled: #707070;
  --mer-select-border--disabled: 1px solid #8c8a8a;
  
  // Invalid state
  --mer-select-background-color--invalid: white;
  --mer-select-color--invalid: black;
  --mer-select-border--invalid: 1px solid #c10909;
  --mer-select-outline--invalid: solid #c10909 2px;
  --mer-select-outline-offset--invalid: -1px;
  
  // Icons
  --mer-select-chevron-icon-color: #b3b3b3;
  --mer-select-chevron-icon-color--hover: #353535;
  
  // Loading indicator
  --mer-select-loading-height: 2px;
  --mer-select-loading-background-color: #d7e8fb;
  --mer-select-loading-color: #0772CD;
}
```

#### MerSelect Panel

```scss
.mer-select-panel {
  --mer-select-panel-background-color: #ffffff;
  --mer-select-panel-border-radius: 8px;
  --mer-select-panel-box-shadow: rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px;
}
```

#### MerOption

```scss
.mer-option {
  // Base option appearance
  --mer-option-font: system-ui, Roboto, sans-serif;
  --mer-option-font-size: 1em;
  --mer-option-font-weight: normal;
  --mer-option-line-height: 1em;
  --mer-option-letter-spacing: normal;
  --mer-option-min-height: 48px;
  --mer-option-side-padding: 8px;
  --mer-option-material-side-padding: 16px;
  --mer-option-group-indent: 20px;
  
  // Colors and states
  --mer-option-color: #121212;
  --mer-option-hover-background-color: #f6f6f6;
  --mer-option-active-background-color: #ececec;
  --mer-option-selected-color: #0d67ca;
  --mer-option-selected-background-color: #eef6ff;
}
```

#### MerProgressBar

```scss
.mer-progress-bar {
  --mer-progress-bar-height: 4px;
  --mer-progress-bar-background-color: rgba(5, 114, 206, 0.2);
  --mer-progress-bar-color: rgb(5, 114, 206);
}
```

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
