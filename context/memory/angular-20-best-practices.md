# Angular 20+ Best Practices and Patterns

Based on analysis of the official Angular documentation in `/reference/angular/`, this document captures key Angular 20+ best practices and patterns for future development reference.

## Signal-Based State Management

### Core Principle
Angular 20+ emphasizes signal-based reactivity over traditional change detection patterns.

```typescript
// ✅ Modern approach with signals
export class MyComponent {
  protected readonly count = signal<number>(0);
  protected readonly doubleCount = computed(() => this.count() * 2);
  
  protected increment(): void {
    this.count.update(n => n + 1);
  }
}
```

```typescript
// ❌ Avoid traditional property binding
export class MyComponent {
  count = 0; // Requires manual change detection
  
  get doubleCount() { return this.count * 2; } // Not reactive
}
```

### Key Signal Functions
- `signal<T>(initialValue)` - Create reactive state
- `computed(() => expression)` - Derived reactive state
- `effect(() => { })` - Side effects based on signal changes
- `signal.set(value)` - Set new value
- `signal.update(fn)` - Update with function

## Component Architecture Patterns

### Change Detection Strategy
Always use OnPush for performance in modern Angular:

```typescript
@Component({
  selector: 'app-my-component',
  changeDetection: ChangeDetectionStrategy.OnPush, // ✅ Always include
  // ...
})
```

### Modern Input/Output Patterns
```typescript
export class MyComponent {
  // ✅ Use input() function
  readonly value = input<number>(0);
  readonly disabled = input<boolean>(false);
  
  // ✅ Use output() function  
  readonly valueChange = output<number>();
  readonly clicked = output<void>();
  
  // ❌ Avoid @Input() and @Output() decorators
  // @Input() value: number = 0;
  // @Output() valueChange = new EventEmitter<number>();
}
```

### Access Modifiers and Immutability
```typescript
export class MyComponent {
  // ✅ Use protected for template-accessible members
  protected readonly items = signal<Item[]>([]);
  protected readonly loading = signal<boolean>(false);
  
  // ✅ Use private for internal logic
  private readonly service = inject(MyService);
  
  // ✅ Use readonly for unchanging references
  protected readonly config = { maxItems: 100 };
}
```

## Dependency Injection Patterns

### Modern inject() Function
```typescript
export class MyComponent {
  // ✅ Use inject() function
  private readonly httpClient = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  
  constructor() {
    // Constructor only for initialization logic
  }
}
```

```typescript
// ❌ Avoid constructor injection
export class MyComponent {
  constructor(
    private httpClient: HttpClient,
    private router: Router
  ) {}
}
```

## Template Patterns

### Modern Control Flow Syntax
```html
<!-- ✅ Use new control flow syntax -->
@if (condition) {
  <div>Conditional content</div>
} @else {
  <div>Alternative content</div>
}

@for (item of items(); track item.id) {
  <div>{{ item.name }}</div>
} @empty {
  <div>No items found</div>
}

@switch (status()) {
  @case ('loading') {
    <app-spinner />
  }
  @case ('error') {
    <app-error />
  }
  @default {
    <app-content />
  }
}
```

```html
<!-- ❌ Avoid structural directives -->
<div *ngIf="condition">Old syntax</div>
<div *ngFor="let item of items">{{ item.name }}</div>
```

### Signal Template Binding
```html
<!-- ✅ Call signals as functions in templates -->
<div>Count: {{ count() }}</div>
<div>Double: {{ doubleCount() }}</div>
<button [disabled]="loading()">Submit</button>

<!-- ✅ Event binding with signal updates -->
<input (input)="searchTerm.set($event.target.value)">
```

## Application Configuration

### Modern Providers
```typescript
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    // ✅ Use provideBrowserGlobalErrorListeners for error handling
    provideBrowserGlobalErrorListeners(),
    
    // ✅ Use zone change detection with coalescing
    provideZoneChangeDetection({ eventCoalescing: true }),
    
    // ✅ Router with modern features
    provideRouter(routes, withComponentInputBinding()),
    
    // ✅ Animations for Material Design
    provideAnimations(),
    
    // ✅ HTTP client with interceptors
    provideHttpClient(withInterceptors([authInterceptor])),
  ]
};
```

### Zoneless Change Detection (Experimental)
```typescript
// For cutting-edge applications
providers: [
  provideExperimentalZonelessChangeDetection(), // Use when stable
  // ... other providers
]
```

## File Organization and Naming

### File Naming Conventions
```
src/app/
├── components/
│   └── user-profile/
│       ├── user-profile.component.ts    # ✅ Always .component.ts
│       ├── user-profile.component.html  # ✅ Template files
│       ├── user-profile.component.scss  # ✅ Style files
│       └── user-profile.component.spec.ts # ✅ Test files
├── services/
│   └── user.service.ts                  # ✅ Always .service.ts
├── models/
│   └── user.model.ts                    # ✅ Always .model.ts
└── guards/
    └── auth.guard.ts                    # ✅ Always .guard.ts
```

### Component Class Naming
```typescript
// ✅ Always suffix with Component
export class UserProfileComponent { }
export class ImageUploadComponent { }

// ❌ Avoid generic names
export class UserProfile { }
export class ImageUpload { }
```

## Service Patterns

### Modern Service Implementation
```typescript
@Injectable({
  providedIn: 'root' // ✅ Always use providedIn for tree-shaking
})
export class DataService {
  // ✅ Use inject() for dependencies
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  
  // ✅ Signal-based reactive state
  private readonly _data = signal<Data[]>([]);
  private readonly _loading = signal<boolean>(false);
  
  // ✅ Readonly public accessors
  readonly data = this._data.asReadonly();
  readonly loading = this._loading.asReadonly();
  
  // ✅ Use computed for derived state
  readonly hasData = computed(() => this._data().length > 0);
  
  constructor() {
    // Setup effects or initialization
    effect(() => {
      console.log('Data changed:', this._data());
    });
  }
}
```

## Material Design Integration

### Provider Setup
```typescript
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(), // ✅ Required for Material
    // Optional Material configuration
    // provideNativeDateAdapter(), // For date components
  ]
};
```

### Component Integration
```typescript
@Component({
  selector: 'app-form',
  imports: [
    // ✅ Import specific Material modules
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    // ✅ Don't import entire MatModule
  ],
  // ...
})
export class FormComponent {
  // ✅ Reactive forms with signals
  protected readonly form = signal(
    this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    })
  );
}
```

## Performance Best Practices

### Component Optimization
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush, // ✅ Always use OnPush
  // ...
})
export class OptimizedComponent {
  // ✅ Use trackBy functions for lists
  protected readonly trackByFn = (index: number, item: any) => item.id;
  
  // ✅ Use readonly for static data
  protected readonly staticConfig = Object.freeze({
    maxItems: 100,
    pageSize: 20
  });
}
```

### Memory Management
```typescript
export class ComponentWithCleanup {
  private readonly destroyRef = inject(DestroyRef);
  
  constructor() {
    // ✅ Use takeUntilDestroyed for subscriptions
    this.dataService.data$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => {
        // Handle data
      });
      
    // ✅ Effects are automatically cleaned up
    effect(() => {
      console.log('Signal changed:', this.mySignal());
    });
  }
}
```

## Testing Patterns

### Component Testing with Signals
```typescript
describe('MyComponent', () => {
  let component: MyComponent;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MyComponent] // ✅ Standalone component
    });
    
    const fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
  });
  
  it('should update signal', () => {
    // ✅ Test signal updates
    component['count'].set(5);
    expect(component['count']()).toBe(5);
    
    // ✅ Test computed values
    expect(component['doubleCount']()).toBe(10);
  });
});
```

## Common Anti-Patterns to Avoid

### Change Detection Issues
```typescript
// ❌ Don't use function calls in templates
<div>{{ computeExpensiveValue() }}</div>

// ✅ Use computed signals instead
protected readonly expensiveValue = computed(() => {
  return this.computeExpensiveValue();
});
```

### State Management Issues
```typescript
// ❌ Don't mutate signal values directly
this.items().push(newItem); // Breaks reactivity

// ✅ Use update or set methods
this.items.update(items => [...items, newItem]);
```

### Subscription Management
```typescript
// ❌ Don't forget to unsubscribe
ngOnInit() {
  this.service.data$.subscribe(data => {
    // This will leak memory
  });
}

// ✅ Use takeUntilDestroyed
constructor() {
  this.service.data$
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(data => {
      // Automatically cleaned up
    });
}
```

## Conclusion

Angular 20+ emphasizes:
1. **Signals over traditional change detection**
2. **OnPush change detection strategy everywhere**
3. **inject() function over constructor injection**
4. **Modern control flow syntax in templates**
5. **Proper file naming and component organization**
6. **Standalone components with targeted imports**
7. **Reactive patterns throughout the application**

These patterns provide better performance, type safety, and developer experience while aligning with Angular's future direction.