# Merelis Angular Components

A library of reusable Angular components and utilities that provides high-quality UI elements for your applications.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)


## Showcase
https://jean-merelis.github.io/angular-components/

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

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dataSource | Array\<T\> &#124; SelectDataSource\<T\> | undefined | List of available options for selection or data source for the component |
| value | T \| T[] \| null | undefined | Currently selected value |
| loading | boolean | false | Displays loading indicator using MerProgressBar |
| disabled | boolean | false | Disables the component |
| readOnly | boolean | false | Sets the component as read-only |
| disableSearch | boolean | false | Disables text search functionality |
| disableOpeningWhenFocusedByKeyboard | boolean | false | Prevents the panel from opening automatically when focused via keyboard |
| multiple | boolean | false | Allows multiple selection |
| canClear | boolean | true | Allows clearing the selection |
| alwaysIncludesSelected | boolean | false | Always includes the selected item in the dropdown, even if it doesn't match the filter. **Note: Only effective when using an array as dataSource, not when using a custom SelectDataSource.** |
| autoActiveFirstOption | boolean | true | Automatically activates the first option when the panel is opened |
| debounceTime | number | 100 | Debounce time for text input (in ms) |
| panelOffsetY | number | 0 | Vertical offset of the options panel |
| compareWith | Comparable\<T\> | undefined | Function to compare values |
| displayWith | DisplayWith\<T\> | undefined | Function to display values as text |
| filterPredicate | FilterPredicate\<T\> | undefined | Function to filter options based on typed text. **Note: Only effective when using an array as dataSource, not when using a custom SelectDataSource.** |
| disableOptionPredicate | OptionPredicate\<T\> | () => false | Function to determine which options should be disabled |
| disabledOptions | T[] | [] | List of options that should be disabled |
| connectedTo | MerSelectPanelOrigin | undefined | Element to which the panel should connect |
| panelClass | string \| string[] | undefined | CSS class(es) applied to the options panel |
| panelWidth | string \| number | undefined | Width of the options panel |
| position | 'auto' \| 'above' \| 'below' | 'auto' | Position of the panel relative to the input |
| placeholder | string | undefined | Text to display when no item is selected |

#### Output Events

| Name | Description |
|------|-------------|
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

## Filtering Behavior and DataSource

The `MerSelectComponent` supports two operation modes for data filtering:

### 1. Automatic Filtering (Array as dataSource)

When you provide an array as `dataSource`, the component performs automatic filtering based on the typed text. In this case, the following inputs control the filtering behavior:

| Name | Type | Description |
|------|------|-------------|
| filterPredicate | FilterPredicate\<T\> | Custom function to filter options based on typed text. **Only applied when the dataSource is an array, not a custom SelectDataSource.** |
| alwaysIncludesSelected | boolean | When true, always includes the selected item(s) in the dropdown, even if they don't match the filter. **Only applied when the dataSource is an array, not a custom SelectDataSource.** |

### 2. Custom Filtering (SelectDataSource)

When you implement and provide a custom `SelectDataSource`, the filtering behavior is determined by the implementation of the dataSource's `applyFilter` method. In this case:

- The component invokes the `applyFilter` method when the user types
- The `filterPredicate` and `alwaysIncludesSelected` inputs are ignored
- The filtering logic is entirely controlled by the dataSource

```typescript
export class CustomDataSource<T> implements SelectDataSource<T> {
    // ...
    
    async applyFilter(criteria: FilterCriteria<T>): void | Promise<void> {
        // Here you implement your own filtering logic
        // The criteria parameter contains:
        // - searchText: the text typed by the user
        // - selected: the currently selected item(s)
        
        // You can decide to include selected items even if they don't match the filter
        // (equivalent to the alwaysIncludesSelected behavior)
        
        // You can also implement your own filtering logic
        // (equivalent to the filterPredicate behavior)
    }
}
```

### Example: Implementing alwaysIncludesSelected behavior in a custom DataSource

If you want to replicate the `alwaysIncludesSelected` behavior in a custom dataSource:

```typescript
async applyFilter(criteria: FilterCriteria<Person>): Promise<void> {
    this.loading$.next(true);
    try {
        // Fetch filtered results
        const filteredResults = await this.service.search(criteria.searchText);
        
        // If we have selected items and want to always include them
        if (criteria.selected) {
            const results = [...filteredResults];
            
            // For multiple selection
            if (Array.isArray(criteria.selected)) {
                criteria.selected.forEach(selectedItem => {
                    // Check if the item is already in the results
                    const exists = results.some(item => 
                        this.compareItems(item, selectedItem)
                    );
                    
                    // If not, add it
                    if (!exists) {
                        results.push(selectedItem);
                    }
                });
            } 
            // For single selection
            else {
                const exists = results.some(item => 
                    this.compareItems(item, criteria.selected)
                );
                
                if (!exists) {
                    results.push(criteria.selected);
                }
            }
            
            this.data.next(results);
        } else {
            this.data.next(filteredResults);
        }
    } finally {
        this.loading$.next(false);
    }
}

// Helper function to compare items
private compareItems(a: Person, b: Person): boolean {
    return a.id === b.id;
}
```

### Choosing Between Array and SelectDataSource

- **Use a simple array** when you have a small set of static data that doesn't require server-side filtering.
- **Implement a SelectDataSource** when you need complete control over filtering, especially for:
    - Fetching data from the server based on typed text (typeahead)
    - Handling large datasets
    - Implementing complex filtering logic
    - Showing loading indicators during asynchronous operations

## Typeahead Functionality with TypeaheadDataSource

The `MerSelectComponent` supports typeahead functionality, allowing you to search for options as you type. The library provides a generic `TypeaheadDataSource` implementation that handles common typeahead requirements including search request cancellation, loading states, and result management.

### TypeaheadSearchService Interface

First, implement the `TypeaheadSearchService` interface to define how search operations will be performed:

```typescript
export interface TypeaheadSearchService<T> {
  /**
   * Search method that takes a query string and returns an Observable of results
   * @param query The search query string
   * @returns Observable of search results
   */
  search(query: string): Observable<T[]>;
}
```

### Using the TypeaheadDataSource

The `TypeaheadDataSource` provides a robust solution for typeahead functionality with automatic cancellation of previous requests, which is essential for a smooth user experience.

#### Implementation

```typescript
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { TypeaheadSearchService, TypeaheadDataSource } from '@merelis/angular/select';

// Define your data model
interface User {
  id: number;
  name: string;
  email: string;
}

// Implement TypeaheadSearchService for your data type
@Injectable({ providedIn: 'root' })
export class UserSearchService implements TypeaheadSearchService<User> {
  constructor(private http: HttpClient) {}
  
  search(query: string): Observable<User[]> {
    // Real implementation would use HttpClient
    return this.http.get<User[]>(`/api/users?q=${query}`);
    
    // Example of a mock implementation for testing:
    /*
    const users = [
      { id: 1, name: 'John Smith', email: 'john@example.com' },
      { id: 2, name: 'Mary Johnson', email: 'mary@example.com' },
      { id: 3, name: 'Peter Williams', email: 'peter@example.com' }
    ];
    
    const results = query 
      ? users.filter(user => user.name.toLowerCase().includes(query.toLowerCase()))
      : users;
      
    return of(results).pipe(delay(300)); // Simulate network delay
    */
  }
}
```

#### Usage in a Component

```typescript
import { Component, OnDestroy } from '@angular/core';
import { MerSelectComponent } from '@merelis/angular/select';
import { TypeaheadDataSource } from '@merelis/angular/select';
import { UserSearchService, User } from './user-search.service';

@Component({
  selector: 'app-user-search',
  standalone: true,
  imports: [MerSelectComponent],
  template: `
    <mer-select
      [(value)]="selectedUser"
      [dataSource]="userDataSource"
      [displayWith]="displayUserName"
      [placeholder]="'Search for users...'"
      [debounceTime]="300">
    </mer-select>
    <p *ngIf="selectedUser">Selected: {{selectedUser.name}}</p>
  `
})
export class UserSearchComponent implements OnDestroy {
  selectedUser: User | null = null;
  userDataSource: TypeaheadDataSource<User>;
  
  constructor(private userSearchService: UserSearchService) {
    // Create the data source with the service
    this.userDataSource = new TypeaheadDataSource<User>(
      userSearchService,         // The search service implementation
      true,                      // Always include selected items in results
      (a, b) => a.id === b.id    // Custom comparison function
    );
  }
  
  ngOnDestroy(): void {
    // Cleanup resources
    this.userDataSource.disconnect();
  }
  
  // Display function for the select component
  displayUserName(user: User): string {
    return user?.name || '';
  }
}
```

### TypeaheadDataSource API

The `TypeaheadDataSource` constructor accepts the following parameters:

| Parameter | Type | Required | Description                                                                                                         |
|-----------|------|----------|---------------------------------------------------------------------------------------------------------------------|
| searchService | TypeaheadSearchService<T> | Yes | The service implementing the search functionality                                                                   |
| alwaysIncludeSelected | boolean | No | Whether to always include selected items in the results even if they don't match the search criteria (default: false) |
| compareItems | (a: T, b: T) => boolean | No | Custom function to determine equality between items (default: reference equality)                                   |

### How It Works

1. **Efficient Request Handling**: When the user types in the search input, previous in-flight requests are automatically cancelled using RxJS `switchMap`, ensuring only the most recent search query is processed.

2. **Loading State Management**: The data source emits loading states that the `MerSelectComponent` can display as a progress indicator.

3. **Selected Items Preservation**: When `alwaysIncludeSelected` is true, selected items will always appear in the dropdown results even if they don't match the current search query.

4. **Error Handling**: If the search service encounters an error, the data source will handle it gracefully, preventing the component from breaking and falling back to an empty result set.

### Example: Server-Side Search with TypeaheadDataSource

Here's a more complete example showing how to implement server-side search:

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { TypeaheadSearchService } from '@merelis/angular/select';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

@Injectable({ providedIn: 'root' })
export class ProductSearchService implements TypeaheadSearchService<Product> {
  private apiUrl = 'https://api.example.com/products';
  
  constructor(private http: HttpClient) {}
  
  search(query: string): Observable<Product[]> {
    // Create request parameters
    let params = new HttpParams();
    if (query) {
      params = params.set('q', query);
    }
    
    // Add pagination if needed
    params = params.set('limit', '20');
    
    // Make the API request
    return this.http.get<Product[]>(this.apiUrl, { params }).pipe(
      catchError(error => {
        console.error('Error fetching products:', error);
        return of([]);
      })
    );
  }
}

// In your component:
@Component({
  selector: 'app-product-search',
  template: `
    <mer-select
      [(value)]="selectedProduct"
      [dataSource]="productDataSource"
      [displayWith]="displayProductName"
      [placeholder]="'Search for products...'"
      [debounceTime]="400">
      
      <!-- Custom option template -->
      <ng-template merSelectOptionDef let-product>
        <div class="product-option">
          <div class="product-name">{{product.name}}</div>
          <div class="product-details">
            <span class="category">{{product.category}}</span>
            <span class="price">${{product.price.toFixed(2)}}</span>
          </div>
        </div>
      </ng-template>
    </mer-select>
  `,
  styles: [`
    .product-option {
      padding: 8px 0;
    }
    .product-name {
      font-weight: bold;
    }
    .product-details {
      display: flex;
      justify-content: space-between;
      font-size: 0.85em;
      color: #666;
    }
  `]
})
export class ProductSearchComponent implements OnDestroy {
  selectedProduct: Product | null = null;
  productDataSource: TypeaheadDataSource<Product>;
  
  constructor(productSearchService: ProductSearchService) {
    this.productDataSource = new TypeaheadDataSource<Product>(
      productSearchService,
      true,
      (a, b) => a.id === b.id
    );
  }
  
  ngOnDestroy(): void {
    this.productDataSource.disconnect();
  }
  
  displayProductName(product: Product): string {
    return product?.name || '';
  }
}
```

### Benefits of Using TypeaheadDataSource

1. **Performance**: Efficiently handles rapid typing by cancelling outdated requests
2. **User Experience**: Shows loading indicators at appropriate times
3. **Resilience**: Provides graceful error handling
4. **Flexibility**: Works with any data type and search implementation
5. **Integration**: Seamlessly works with MerSelectComponent's search capabilities

The `TypeaheadDataSource` implementation follows best practices for reactive programming with RxJS and works with both simple and complex typeahead scenarios.

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
|------|------|---------|-------------|
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

## Testing with Component Harnesses

The library provides testing harnesses for the `MerSelectComponent` and its options, making it easier to test components that use these elements. These harnesses are built on top of Angular's Component Test Harnesses (CDK Testing) and provide a clean, implementation-detail-free way to interact with components in tests.

### Installation

The testing harnesses are included in the package and can be imported from:

```typescript
import { MerSelectHarness } from '@merelis/angular/select/testing';
import { MerSelectOptionHarness } from '@merelis/angular/select/testing';
```

### Setting Up Component Test Harnesses

To use the harnesses in your tests, you'll need to set up the Angular test environment with the harness environment:

```typescript
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MerSelectHarness } from '@merelis/angular/select/testing';

describe('YourComponent', () => {
  let fixture: ComponentFixture<YourComponent>;
  let component: YourComponent;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YourComponent],
      // Include other necessary imports here
    }).compileComponents();

    fixture = TestBed.createComponent(YourComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  // Tests go here
});
```

### MerSelectHarness API

The `MerSelectHarness` provides methods to interact with and query the state of a `MerSelectComponent`:

| Method | Description |
|--------|-------------|
| `static with(filters: MerSelectHarnessFilters)` | Gets a `HarnessPredicate` that can be used to find a select with specific attributes |
| `click()` | Clicks on the select trigger to open/close the panel |
| `clickOnClearIcon()` | Clicks on the clear icon to clear the selection |
| `focus()` | Focuses the select input |
| `blur()` | Removes focus from the select input |
| `isFocused()` | Gets whether the select is focused |
| `getValue()` | Gets the text value displayed in the select trigger |
| `isDisabled()` | Gets whether the select is disabled |
| `getSearchText()` | Gets the current text in the search input |
| `setTextSearch(value: string)` | Sets the text in the search input |
| `isOpen()` | Gets whether the options panel is open |
| `getOptions(filters?: Omit<SelectOptionHarnessFilters, 'ancestor'>)` | Gets the options inside the panel |
| `clickOptions(filters: SelectOptionHarnessFilters)` | Clicks the option(s) matching the given filters |

### MerSelectOptionHarness API

The `MerSelectOptionHarness` provides methods to interact with and query the state of a select option:

| Method | Description |
|--------|-------------|
| `static with(filters: SelectOptionHarnessFilters)` | Gets a `HarnessPredicate` that can be used to find an option with specific attributes |
| `click()` | Clicks the option |
| `getText()` | Gets the text of the option |
| `isDisabled()` | Gets whether the option is disabled |
| `isSelected()` | Gets whether the option is selected |
| `isActive()` | Gets whether the option is active |
| `isMultiple()` | Gets whether the option is in multiple selection mode |

### Example Test

Here's an example of testing a component that uses `MerSelectComponent`:

```typescript
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { HarnessLoader } from '@angular/cdk/testing';
import { MerSelectHarness, MerSelectOptionHarness } from '@merelis/angular/select/testing';
import { MerSelectComponent } from '@merelis/angular/select';

@Component({
  template: `
    <mer-select
      [dataSource]="fruits"
      [(value)]="selectedFruit"
      [placeholder]="'Select a fruit'">
    </mer-select>
  `,
  standalone: true,
  imports: [MerSelectComponent]
})
class TestComponent {
  fruits = ['Apple', 'Banana', 'Orange', 'Strawberry'];
  selectedFruit: string | null = null;
}

describe('TestComponent', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  });

  it('should open the select and select an option', async () => {
    // Get the select harness
    const select = await loader.getHarness(MerSelectHarness);
    
    // Check initial state
    expect(await select.getValue()).toBe('');
    expect(await select.isOpen()).toBe(false);
    
    // Open the select
    await select.click();
    expect(await select.isOpen()).toBe(true);
    
    // Get all options
    const options = await select.getOptions();
    expect(options.length).toBe(4);
    
    // Click the "Banana" option
    await select.clickOptions({ text: 'Banana' });
    
    // Check that the panel is closed after selection
    expect(await select.isOpen()).toBe(false);
    
    // Check that the value is updated
    expect(await select.getValue()).toBe('Banana');
    expect(component.selectedFruit).toBe('Banana');
  });

  it('should filter options based on search text', async () => {
    const select = await loader.getHarness(MerSelectHarness);
    
    // Open the select
    await select.click();
    
    // Enter search text
    await select.setTextSearch('ber');
    
    // Get filtered options
    const options = await select.getOptions();
    expect(options.length).toBe(1);
    expect(await options[0].getText()).toBe('Strawberry');
    
    // Select the filtered option
    await options[0].click();
    expect(await select.getValue()).toBe('Strawberry');
  });
});
```

### Testing with Complex Data Structures

When using objects as options, you can leverage the harness methods to test more complex scenarios:

```typescript
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { HarnessLoader } from '@angular/cdk/testing';
import { MerSelectHarness } from '@merelis/angular/select/testing';
import { MerSelectComponent } from '@merelis/angular/select';

interface User {
  id: number;
  name: string;
  email: string;
}

@Component({
  template: `
    <mer-select
      [dataSource]="users"
      [(value)]="selectedUser"
      [displayWith]="displayUser"
      [compareWith]="compareUsers"
      [placeholder]="'Select a user'">
    </mer-select>
  `,
  standalone: true,
  imports: [MerSelectComponent]
})
class UserSelectComponent {
  users: User[] = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com' }
  ];
  selectedUser: User | null = null;
  
  displayUser(user: User): string {
    return user?.name || '';
  }
  
  compareUsers(user1: User, user2: User): boolean {
    return user1?.id === user2?.id;
  }
}

describe('UserSelectComponent', () => {
  let fixture: ComponentFixture<UserSelectComponent>;
  let component: UserSelectComponent;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserSelectComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(UserSelectComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  });

  it('should select a user by name and update the component model', async () => {
    const select = await loader.getHarness(MerSelectHarness);
    
    // Open the select
    await select.click();
    
    // Click the option with Jane's name
    await select.clickOptions({ text: 'Jane Smith' });
    
    // Check that the select shows the correct text
    expect(await select.getValue()).toBe('Jane Smith');
    
    // Check that the component model is updated with the correct object
    expect(component.selectedUser).toEqual(component.users[1]);
    expect(component.selectedUser?.id).toBe(2);
  });
});
```

### Testing Multiple Selection

You can also test the multiple selection mode of the `MerSelectComponent`:

```typescript
@Component({
  template: `
    <mer-select
      [dataSource]="colors"
      [(value)]="selectedColors"
      [multiple]="true"
      [placeholder]="'Select colors'">
    </mer-select>
  `,
  standalone: true,
  imports: [MerSelectComponent]
})
class ColorSelectComponent {
  colors = ['Red', 'Green', 'Blue', 'Yellow', 'Purple'];
  selectedColors: string[] = [];
}

describe('ColorSelectComponent', () => {
  // Test setup...

  it('should support multiple selection', async () => {
    const select = await loader.getHarness(MerSelectHarness);
    
    // Open the select
    await select.click();
    
    // Select multiple options
    await select.clickOptions({ text: 'Red' });
    await select.clickOptions({ text: 'Blue' });
    await select.clickOptions({ text: 'Yellow' });
    
    // Check component model
    expect(component.selectedColors).toEqual(['Red', 'Blue', 'Yellow']);
    
    // Verify that the selected options are marked as selected
    const options = await select.getOptions();
    for (const option of options) {
      const text = await option.getText();
      const isSelected = await option.isSelected();
      
      if (['Red', 'Blue', 'Yellow'].includes(text)) {
        expect(isSelected).toBe(true);
      } else {
        expect(isSelected).toBe(false);
      }
    }
  });
});
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
import { MerSelectFormFieldControl } from "@merelis/angular-material/select";

@Component({
  selector: 'app-material-example',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MerSelectComponent,
    MerSelectFormFieldControl
  ],
  providers: [
    provideMerMaterialIntegration() // Enable integration with Angular Material
  ],
  template: `
    <mat-form-field appearance="outline">
      <mat-label>Select a user</mat-label>
      <mer-select merSelectFormField
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
  --mer-select-input-height: 100%;
  --mer-select-input-width: 100%;
  --mer-select-trigger-wrapper-gap: 4px;
    
    
  // multiple select  
  --mer-select-multiple-trigger-wrapper-gap: 4px;
  --mer-select-multiple-side-padding: 2px;
  --mer-select-multiple-input-min-width: 33%;
  --mer-select-multiple-input-height: 24px;
  --mer-select-multiple-input-padding: 0 4px;
  --mer-select-multiple-values-gap: 4px;
  --mer-select-multiple-values-padding: 0;
  --mer-select-chip-background-color: #e6e6e6;
  --mer-select-chip-border-radius: 8px;
  --mer-select-chip-padding: 2px 2px 2px 8px;
  --mer-select-chip-font-size: 0.875rem;

  --mer-select-chip-remove-cursor: pointer;
  --mer-select-chip-remove-margin-left: 4px;
  --mer-select-chip-remove-font-size: 1rem;
  --mer-select-chip-remove-line-height: 1rem;
  --mer-select-chip-remove-font-weight: normal;
  --mer-select-chip-remove-text-color: #000;
  --mer-select-chip-remove-bg-color: #d1d1d1;
  --mer-select-chip-remove-border-radius: 9999px;
  --mer-select-chip-remove-padding: 0;
  --mer-select-chip-remove-width: 12px;
  --mer-select-chip-remove-height: 12px;
  --mer-select-chip-remove-opacity: .5;

  --mer-select-chip-remove-text-color-hover: white;
  --mer-select-chip-remove-bg-color-hover: #505050;
  --mer-select-chip-remove-opacity-hover: 1;
    
  
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
  
  --mer-option-selected-hover-color: #0d67ca;
  --mer-option-selected-hover-background-color: #e1eef8;
  --mer-option-selected-active-color: #0d67ca;
  --mer-option-selected-active-background-color: #dcecfb;
  --mer-option-selected-active-hover-color: #0d67ca;
  --mer-option-selected-active-hover-background-color: #dceafa;
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
