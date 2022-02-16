# NgxFlagger

[![CI](https://github.com/fakeJan499/ngx-flagger/actions/workflows/main.yml/badge.svg)](https://github.com/fakeJan499/ngx-flagger/actions/workflows/main.yml)
[![Coverage Status](https://coveralls.io/repos/github/fakeJan499/ngx-flagger/badge.svg?branch=master)](https://coveralls.io/github/fakeJan499/ngx-flagger?branch=master)

This is a library for runtime feature flags in Angular. It provides service, guard and directive to manage features in
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

Use **\*ngxFlagger** directive to enable or disable some sections in your template. It works pretty much the same as
*\*ngIf* Angular directive, but instead of boolean expression you provide a required feature flag expression. When the
required feature flag expression is evaluated as true, the template provided in a ``then`` clause is rendered, and when
false, the template provided in an optional ``else`` clause is rendered.

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
  {
    path: 'routeA',
    component: ComponentA,
    canActivate: [NgxFlaggerGuard],
    data: {requiredFeatureFlag: 'flagA', featureFlagRedirect: '/'}
  }
]
```

## Syntax

* Use ``.`` separated names to select nested flags.
* Add ``!`` as the first character in the required flag to negate the result.
* Use ``*`` to check if any flag is enabled. You can use it at any nesting level.
* Use ``&`` to check if all flags are enabled. You can use it at any nesting level.
* Use logical operators ``&&`` and ``||`` to combine 2 or more required flag expressions.
* Group logical operations by ``()``  to ensure the order in which logical operations are performed.

> Remember that all logical operations (``!``, ``&&``, ``||``) are performed in the same order as boolean operations in JS.

## Configuration

Configure the **ngx-flagger** behaviour by passing a configuration object in the *forRoot* static method of the **
NgxFlaggerModule**.

### Path

The ``path`` is a path to the file with feature flags. By default, the NgxFlagger initializer will look for
the ``assets/config.json`` file.  
It is possible to have multiple files with feature flags. The simplest way to provide information about files is to set
an array of strings as the ``path`` property of the configuration object. Each string is a path to file with feature
flags.  
Additionally, you can wrap feature flags from any file in a wrapper object. To do it, replace the string value
with ``{ path: string, wrapperName: string }`` object.

### Log Level

The ``logLevel`` indicates which logs will be shown in the console. There are 3 different levels of
logs: ```ERROR, WARN, INFO```. With ``LogLevel.INFO`` all logs will be shown, ``LogLevel.WARN`` hides *info* logs
and ``LogLevel.ERROR`` shows only *error* level logs. The default value is ``LogLevel.WARN``. If you want to disable all
logs, check **Logs Disabled**.

### Logs Disabled

By setting the ``logsDisabled`` to true, you can disable all logs. The common use case is to disable logs in production.

### Flags Always True

Set the ``flagsAlwaysTrue`` to *true* to enable all flags. It can be usefully in development. 

