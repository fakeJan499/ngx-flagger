# NgxFlagger

This is a library for runtime feature flags in Angular. 
It provides service, guard and directive to manage features in your application.

## Installation

```bash
npm install ngx-flagger --save

# or

yarn add ngx-flagger
```

## Usage

Add the **NgxFlaggerModule** to your ``app.module.ts`` in ``imports`` array.

```typescript
import {NgxFlaggerModule} from 'ngx-flagger';

@NgModule({
  imports: [NgxFlaggerModule.forRoot({})]
})
```

Also, you must create a file with feature flags.
By default, the NgxFlagger initializer will look for ``assets/config.json`` file.  
Example file:

```json
{
  "flagA": true,
  "flagsContainer": {
    "nestedFlag": false
  }
}
```

### Service

Use **NgxFlaggerService** to enable or disables some features in typescript code.
``isFeatureFlagEnabled`` returns true if feature flag is enabled, false otherwise.

```typescript

constructor(private ngxFlagger: NgxFlaggerService) {
  const featureOn = this.ngxFlagger.isFeatureFlagEnabled('flagName');
}
```

### Directive

Use **\*ngxFlagger** directive to enable or disable some sections in your template.

```angular2html
<div *ngxFlagger="'someFeature'; else elseBlock">
  Text to display only if someFeature flag is true.
</div>
<ng-template #elseBlock>Alternate text.</ng-template>
```

### Guard

Use **NgxFlaggerGuard** to protect some routes. 
**NgxFlaggerGuard** implements *CanActivate* and *CanActivateChild* interfaces.
To provide required data for guard, you need to add ``requiredFeatureFlag`` and ``featureFlagRedirect``
properties in route data.

```typescript
import {NgxFlaggerGuard} from "ngx-flagger";

const routes = [
  {path: 'routeA', component: ComponentA, canActivate: [NgxFlaggerGuard], data: {requiredFeatureFlag: 'flagA', featureFlagRedirect: '/'}}
]
```

## Syntax

* Use ``.`` separated names to select nested flags.
* Add ``!`` as the first character in the required flag to negate the result.
* Use ``*`` to check if any flag is enabled. You can use it at any nesting level.

## Configuration

```typescript
interface RootConfig {
  path?: string;
  flagsAlwaysTrue?: boolean;
  debugMessagesDisabled?: boolean;
}
```

