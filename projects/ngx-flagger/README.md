# NgxFlagger

[![CI](https://github.com/fakeJan499/ngx-flagger/actions/workflows/main.yml/badge.svg)](https://github.com/fakeJan499/ngx-flagger/actions/workflows/main.yml)
[![Coverage Status](https://coveralls.io/repos/github/fakeJan499/ngx-flagger/badge.svg?branch=master)](https://coveralls.io/github/fakeJan499/ngx-flagger?branch=master)

This is a library for runtime and build-time feature flags in Angular. It provides service, guard and directive to
manage features in
your application.

Demo: https://stackblitz.com/edit/ngx-flagger-playground

## Installation

```bash
npm install ngx-flagger --save

# or

yarn add ngx-flagger
```

## Usage

Add the **NgxFlaggerModule** to your ``app.module.ts`` in ``imports`` array.
``NgxFlaggerModule.forRoot()`` method requires a config object with a loader provider.
You can write your own loader, or import an existing one.

```typescript
import {NgxFlaggerModule, FlagsLoaderService, FlagsHttpLoaderService} from 'ngx-flagger';

@NgModule({
  imports: [NgxFlaggerModule.forRoot({
    loader: {
      provide: FlagsLoaderService,
      useClass: FlagsHttpLoaderService
    }
  })]
})
```

If you want to configure **FlagsHttpLoaderService** (e.g. use not default path) use a factory provider instead of class
provider.

In case you are using **FlagsHttpLoaderService**, you must create a file with feature flags.
By default, the **FlagsHttpLoaderService** loader will look for ``/assets/feature-management.json`` file.  
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
class SomeComponent {
    constructor(private ngxFlagger: NgxFlaggerService) {
        const isFeatureEnabled = this.ngxFlagger.isFeatureFlagEnabled('flagName');
    }
}
```

### Directive

Use **\*ngxFlagger** directive to enable or disable some sections in your templates. It works pretty much the same as
the
*\*ngIf* Angular directive, but instead of boolean expression you provide a required feature flag expression. When the
required feature flag expression is evaluated as true, the template is rendered.
**\*ngxFlagger** supports both ``else`` and ``then`` clauses.

```angular2html
<div *ngxFlagger="'someFeature'; else elseBlock">
  Text to display only if someFeature flag is true.
</div>
<ng-template #elseBlock>Alternate text.</ng-template>
```

### Guard

Use **ngxFlaggerGuardFactory** function to protect some routes of your application.
The factory function accepts two arguments. First argument is required feature flag expression.
The second, optional one is a config object.

```typescript
import {ngxFlaggerGuardFactory} from "ngx-flagger";

const routes = [
  {
    path: 'routeA',
    component: ComponentA,
    canActivate: [ngxFlaggerGuardFactory('featureFlagA')],
  },
  {
    path: 'routeB',
    component: ComponentB,
    canActivate: [ngxFlaggerGuardFactory('featureFlagB', {redirectTo: '/'})],
  }
]
```

## Syntax

* Use ``.`` separated names to select nested flags.
* Add ``!`` as the first character of the required flag to negate the result.
* Use ``*`` to check if any flag is enabled. You can use it at any nesting level.
* Use ``&`` to check if all flags are enabled. You can use it at any nesting level.
* Use logical operators ``&&`` and ``||`` to combine 2 or more required flag expressions.
* Group logical operations by ``()``  to ensure the order in which logical operations are performed.

> Remember that all logical operations (``!``, ``&&``, ``||``) are performed in the same order as boolean operations in
> JS.

## Logger

``NgxFlaggerModule.forRoot()`` method config object accepts a ``logger`` property with a logger provider.
Logger is used to log errors, warnings and infos about events that occurs in ngx-flagger.

By default, **NoopLogger** is used. This logger don't do anything.
But, you may want to create your own logger or use the existing **ConsoleLoggerService**.
In case you want to create your own logger, make sure the logger extends or implements **LoggerService** you may import
from `'ngx-flagger'`.

```typescript
import {NgxFlaggerModule, LoggerService, ConsoleLoggerService, LogLevel} from 'ngx-flagger';

@NgModule({
  imports: [NgxFlaggerModule.forRoot({
    logger: {
      provide: LoggerService,
      useValue: new ConsoleLoggerService(LogLevel.INFO)
    },
    // rest of the config 
  })]
})
```

## Configuration

Configure the **ngx-flagger** behaviour by passing a configuration object in the ``forRoot`` static method of the
**NgxFlaggerModule**.

## Loader

Provider of a loader that will load feature flags. The loader needs to extend or implement **FlagsLoaderService**.

## Logger

Provider of a logger that will be used inside ngx-flagger. The logger needs to extend or implement **LoggerService**.

### Flags Always True

Set the ``flagsAlwaysTrue`` to *true* to enable all flags. It may be useful in development.

### Development mode

Set the ``developmentMode`` to *true* to add additional debugging features.
It makes sense to use it only during development to ensure there are no feature flags object mutations. 
