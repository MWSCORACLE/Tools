---
name: netsuite-suitescript-2x
description: >
  NetSuite SuiteScript 2.x expert skill. Use when the user asks about
  SuiteScript 2.x API modules, script types, record operations, searches,
  UI building, custom integrations, or any NetSuite development task using
  the SuiteScript 2.x (or 2.1) framework.
---

# NetSuite SuiteScript 2.x Skill

You are a NetSuite SuiteScript 2.x expert. Use this skill to answer questions,
write scripts, debug issues, and build complete solutions using the SuiteScript
2.x API.

---

## Framework Overview

SuiteScript 2.x (including 2.1) is NetSuite's server-side and client-side
JavaScript API. Every script begins with an `@NScriptType` JSDoc annotation and
a `define()` (AMD) or `require()` call that declares module dependencies.

### SuiteScript 2.0 vs 2.1
| Feature | SS 2.0 | SS 2.1 |
|---|---|---|
| Module syntax | AMD `define()` | AMD `define()` + ES modules (`import`) |
| `const` / `let` | Limited | Full ES6+ support |
| Arrow functions | Limited | Full support |
| Destructuring | No | Yes |
| Template literals | No | Yes |
| `@NScriptType` required | Yes | Yes |
| `@NAmdConfig` | Optional | Optional |

### Script File Header Pattern
```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript   // or ClientScript, ScheduledScript, etc.
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', 'N/log'], (record, search, log) => {
  // ... entry point functions
});
```

---

## Script Types & Entry Points

### 1. Client Script (`ClientScript`)
Runs in the browser on record forms.

| Entry Point | Trigger |
|---|---|
| `pageInit(context)` | Form loads |
| `fieldChanged(context)` | Any field changes |
| `postSourcing(context)` | After field is sourced |
| `sublistChanged(context)` | Sublist line added/removed |
| `lineInit(context)` | New sublist line initialized |
| `validateField(context)` | Before field value set (return bool) |
| `validateLine(context)` | Before line committed (return bool) |
| `validateInsert(context)` | Before line inserted (return bool) |
| `validateDelete(context)` | Before line deleted (return bool) |
| `saveRecord(context)` | Before save (return bool) |

`context` properties: `currentRecord`, `sublistId`, `fieldId`, `line`,
`column`, `value`, `oldValue`, `mode` (`"create"` | `"edit"` | `"view"`).

```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */
define(['N/currentRecord', 'N/log'], (currentRecord, log) => {
  const fieldChanged = (context) => {
    if (context.fieldId === 'entity') {
      const rec = context.currentRecord;
      log.debug({ title: 'Customer changed', details: rec.getValue('entity') });
    }
  };
  const saveRecord = (context) => {
    const rec = context.currentRecord;
    const amount = rec.getValue('amount');
    if (!amount) {
      alert('Amount is required');
      return false;
    }
    return true;
  };
  return { fieldChanged, saveRecord };
});
```

---

### 2. User Event Script (`UserEventScript`)
Runs server-side when a record is created/viewed/updated/deleted.

| Entry Point | Trigger |
|---|---|
| `beforeLoad(context)` | Before record is loaded/displayed |
| `beforeSubmit(context)` | Before record is saved |
| `afterSubmit(context)` | After record is saved |

`context` properties: `newRecord`, `oldRecord`, `type` (UserEventType enum),
`form` (ServerWidget form, only in `beforeLoad`), `UserEventType`.

```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/log', 'N/email', 'N/runtime'], (record, log, email, runtime) => {
  const beforeLoad = (context) => {
    if (context.type === context.UserEventType.VIEW) {
      context.form.addButton({
        id: 'custpage_mybutton',
        label: 'Custom Action',
        functionName: 'myClientFunction'
      });
    }
  };

  const beforeSubmit = (context) => {
    if (context.type === context.UserEventType.CREATE ||
        context.type === context.UserEventType.EDIT) {
      const newRec = context.newRecord;
      // Validate or transform data before save
      const total = newRec.getValue('total');
      if (total > 100000) {
        newRec.setValue({ fieldId: 'approvalstatus', value: 'PENDING' });
      }
    }
  };

  const afterSubmit = (context) => {
    if (context.type === context.UserEventType.CREATE) {
      const newRec = context.newRecord;
      log.audit({ title: 'Record Created', details: `ID: ${newRec.id}` });
    }
  };

  return { beforeLoad, beforeSubmit, afterSubmit };
});
```

---

### 3. Scheduled Script (`ScheduledScript`)
Runs on a schedule or triggered programmatically.

| Entry Point | Trigger |
|---|---|
| `execute(context)` | When the script executes |

`context` properties: `type` (ScheduledScript.InvocationType).

```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['N/search', 'N/record', 'N/log', 'N/runtime'], (search, record, log, runtime) => {
  const execute = (context) => {
    // Process records in bulk; watch governance units
    const searchObj = search.create({
      type: search.Type.SALES_ORDER,
      filters: [['status', search.Operator.ANYOF, 'SalesOrd:A']],
      columns: ['internalid', 'entity', 'total']
    });

    searchObj.run().each((result) => {
      // Check remaining governance
      if (runtime.getCurrentScript().getRemainingUsage() < 100) {
        return false; // Stop processing
      }
      const orderId = result.getValue('internalid');
      log.debug('Processing order', orderId);
      return true;
    });
  };
  return { execute };
});
```

---

### 4. Map/Reduce Script (`MapReduceScript`)
Best for high-volume processing (millions of records). Uses distributed parallel processing.

| Entry Point | Purpose |
|---|---|
| `getInputData(context)` | Returns data set (search, array, or object) |
| `map(context)` | One call per input item; emits key-value pairs |
| `reduce(context)` | One call per unique key with all values |
| `summarize(context)` | Final step; handles errors & reports results |

```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/search', 'N/record', 'N/log', 'N/email', 'N/runtime'],
  (search, record, log, email, runtime) => {

  const getInputData = (context) => {
    return search.create({
      type: 'invoice',
      filters: [['amountremaining', 'greaterthan', '0']],
      columns: ['internalid', 'entity', 'amountremaining']
    });
  };

  const map = (context) => {
    const result = JSON.parse(context.value);
    const customerId = result.values.entity[0].value;
    const amount = result.values.amountremaining;
    context.write({ key: customerId, value: amount });
  };

  const reduce = (context) => {
    const total = context.values.reduce((sum, v) => sum + parseFloat(v), 0);
    log.audit('Customer Balance', `Customer ${context.key}: $${total.toFixed(2)}`);
    context.write({ key: context.key, value: total });
  };

  const summarize = (context) => {
    context.mapSummary.errors.iterator().each((key, err) => {
      log.error('Map Error', `Key: ${key}, Error: ${err}`);
      return true;
    });
    context.reduceSummary.errors.iterator().each((key, err) => {
      log.error('Reduce Error', `Key: ${key}, Error: ${err}`);
      return true;
    });
    log.audit('Summary', `Total duration: ${context.seconds}s`);
  };

  return { getInputData, map, reduce, summarize };
});
```

---

### 5. Suitelet (`Suitelet`)
Generates custom pages and forms. Accessible via internal URL.

| Entry Point | Trigger |
|---|---|
| `onRequest(context)` | HTTP GET or POST |

`context` properties: `request`, `response`, `request.method` (`"GET"` | `"POST"`).

```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget', 'N/search', 'N/log'], (serverWidget, search, log) => {
  const onRequest = (context) => {
    if (context.request.method === 'GET') {
      const form = serverWidget.createForm({ title: 'My Suitelet' });
      form.addField({ id: 'custpage_name', type: serverWidget.FieldType.TEXT, label: 'Name' });
      form.addSubmitButton({ label: 'Submit' });
      context.response.writePage(form);
    } else {
      const name = context.request.parameters.custpage_name;
      context.response.write(`Hello, ${name}!`);
    }
  };
  return { onRequest };
});
```

---

### 6. RESTlet (`Restlet`)
REST-style endpoint. Supports GET, POST, PUT, DELETE.

| Entry Point | HTTP Method |
|---|---|
| `get(requestParams)` | GET |
| `post(requestBody)` | POST |
| `put(requestBody)` | PUT |
| `delete(requestParams)` | DELETE |

```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */
define(['N/record', 'N/search', 'N/log'], (record, search, log) => {
  const get = (params) => {
    const { recordType, id } = params;
    const rec = record.load({ type: recordType, id: parseInt(id) });
    return { id: rec.id, name: rec.getValue('name') };
  };

  const post = (body) => {
    const { recordType, fields } = body;
    const rec = record.create({ type: recordType, isDynamic: true });
    Object.entries(fields).forEach(([key, val]) => {
      rec.setValue({ fieldId: key, value: val });
    });
    const id = rec.save();
    return { success: true, id };
  };

  return { get, post };
});
```

---

### 7. Portlet (`PortletScript`)
Dashboard portlet entry point: `render(context)`.

### 8. Mass Update Script (`MassUpdateScript`)
Entry point: `each(context)`. One call per selected record.

### 9. Workflow Action Script (`WorkflowActionScript`)
Entry point: `onAction(context)`. Triggered from workflow.

### 10. Bundle Installation Script (`BundleInstallationScript`)
Entry points: `beforeInstall`, `afterInstall`, `beforeUpdate`, `afterUpdate`, `beforeUninstall`.

---

## Module Catalog (N/*)

### `N/record` — Record CRUD

```javascript
// Load a record
const rec = record.load({ type: record.Type.SALES_ORDER, id: 123, isDynamic: false });

// Create a record
const newRec = record.create({ type: record.Type.CUSTOMER, isDynamic: true });
newRec.setValue({ fieldId: 'companyname', value: 'Acme Corp' });
newRec.setValue({ fieldId: 'email', value: 'acme@example.com' });
const id = newRec.save({ enableSourcing: true, ignoreMandatoryFields: false });

// Edit a record (submitFields - most governance-efficient)
record.submitFields({
  type: record.Type.OPPORTUNITY,
  id: 456,
  values: { probability: 75, projectedtotal: 50000 }
});

// Copy
const copied = record.copy({ type: record.Type.SALES_ORDER, id: 789 });

// Transform
const invoice = record.transform({
  fromType: record.Type.SALES_ORDER,
  fromId: 100,
  toType: record.Type.INVOICE,
  isDynamic: true
});

// Delete
record.delete({ type: record.Type.LEAD, id: 200 });

// Working with sublists
const rec2 = record.load({ type: 'salesorder', id: 50, isDynamic: true });
const lineCount = rec2.getLineCount({ sublistId: 'item' });

for (let i = 0; i < lineCount; i++) {
  const itemId  = rec2.getSublistValue({ sublistId: 'item', fieldId: 'item',    line: i });
  const qty     = rec2.getSublistValue({ sublistId: 'item', fieldId: 'quantity', line: i });
  rec2.setSublistValue({ sublistId: 'item', fieldId: 'quantity', line: i, value: qty * 2 });
}

// Dynamic mode sublist
rec2.selectLine({ sublistId: 'item', line: 0 });
rec2.setCurrentSublistValue({ sublistId: 'item', fieldId: 'quantity', value: 10 });
rec2.commitLine({ sublistId: 'item' });
rec2.save();
```

**Key `record.Type` constants:**
`ACCOUNT`, `ASSEMBLY_BUILD`, `BILL_OF_MATERIALS`, `BIN`, `CASH_SALE`,
`CONTACT`, `CREDIT_MEMO`, `CURRENCY`, `CUSTOMER`, `CUSTOMER_DEPOSIT`,
`CUSTOMER_PAYMENT`, `CUSTOMER_REFUND`, `EMPLOYEE`, `ESTIMATE`, `EXPENSE_REPORT`,
`INVENTORY_ADJUSTMENT`, `INVENTORY_ITEM`, `INVOICE`, `ITEM_FULFILLMENT`,
`ITEM_RECEIPT`, `JOURNAL_ENTRY`, `KIT_ITEM`, `LEAD`, `LOT_NUMBERED_ITEM`,
`OPPORTUNITY`, `PARTNER`, `PRICE_LEVEL`, `PURCHASE_ORDER`, `PURCHASE_REQUISITION`,
`RETURN_AUTHORIZATION`, `SALES_ORDER`, `SERVICE_ITEM`, `SUBSIDIARY`,
`TRANSACTION`, `TRANSFER_ORDER`, `VENDOR`, `VENDOR_BILL`, `VENDOR_CREDIT`,
`VENDOR_PAYMENT`, `WORK_ORDER`.

---

### `N/search` — Saved & Ad-hoc Searches

```javascript
// Ad-hoc search
const results = search.create({
  type: search.Type.CUSTOMER,
  filters: [
    search.createFilter({ name: 'email', operator: search.Operator.ISNOTEMPTY }),
    ['custentity_region', search.Operator.ANYOF, ['US', 'CA']]
  ],
  columns: [
    search.createColumn({ name: 'internalid' }),
    search.createColumn({ name: 'companyname' }),
    search.createColumn({ name: 'email' }),
    search.createColumn({ name: 'salesrep', sort: search.Sort.ASC })
  ]
}).run().getRange({ start: 0, end: 1000 });

results.forEach((r) => {
  const id   = r.getValue('internalid');
  const name = r.getValue('companyname');
  const rep  = r.getText('salesrep');   // .getText() for list/record fields
});

// Paginated iteration (safe for large result sets)
const pagedData = search.create({ type: 'transaction', filters: [...] })
  .runPaged({ pageSize: 1000 });

pagedData.pageRanges.forEach((pageRange) => {
  pagedData.fetch({ index: pageRange.index }).data.forEach((result) => {
    // process
  });
});

// .each() iterator (up to 4000 results)
searchObj.run().each((result) => {
  // return true to continue, false to stop
  return true;
});

// Load & run saved search
const saved = search.load({ id: 'customsearch_my_customers' });
saved.run().getRange({ start: 0, end: 100 });

// Join fields
search.createColumn({ name: 'email', join: 'salesrep' });

// Summary types
search.createColumn({ name: 'amount', summary: search.Summary.SUM });
```

**Key Filter Operators:**
`ANYOF`, `NONEOF`, `IS`, `ISNOT`, `ISEMPTY`, `ISNOTEMPTY`, `CONTAINS`,
`DOESNOTCONTAIN`, `STARTSWITH`, `GREATERTHAN`, `LESSTHAN`, `BETWEEN`,
`ONORAFTER`, `ONORBEFORE`, `WITHIN`.

---

### `N/query` — SuiteQL / WorkBook Query API

```javascript
// SuiteQL (SQL-like query)
const result = query.runSuiteQL({
  query: `
    SELECT t.id, t.trandate, t.entity, SUM(tl.amount) AS total
    FROM transaction t
    JOIN transactionline tl ON tl.transaction = t.id
    WHERE t.recordtype = 'salesorder'
      AND t.trandate >= TO_DATE('2025-01-01','YYYY-MM-DD')
    GROUP BY t.id, t.trandate, t.entity
    ORDER BY t.trandate DESC
  `
});
result.results.forEach((row) => {
  log.debug('Order', `${row.values[0]} - ${row.values[3]}`);
});

// Parameterized SuiteQL
const paged = query.runSuiteQLPaged({
  query: 'SELECT id, companyname FROM customer WHERE isperson = ? AND isinactive = ?',
  params: ['F', 'F'],
  pageSize: 500
});
paged.iterator().each((page) => {
  page.value.data.results.forEach((row) => { /* ... */ });
  return true;
});
```

---

### `N/log` — Logging

```javascript
log.debug({ title: 'Debug message', details: 'some value' });
log.audit({ title: 'Audit trail', details: JSON.stringify(payload) });
log.error({ title: 'Error occurred', details: error.message });
log.emergency({ title: 'Critical failure', details: error.stack });
```

Log levels (increasing severity): `DEBUG` < `AUDIT` < `ERROR` < `EMERGENCY`.
Script deployments can filter minimum log level.

---

### `N/runtime` — Script & Session Context

```javascript
// Current script context
const script = runtime.getCurrentScript();
const remaining = script.getRemainingUsage();      // governance units left
const param     = script.getParameter({ name: 'custscript_my_param' });
const scriptId  = script.id;
const deployId  = script.deploymentId;

// Current user
const user = runtime.getCurrentUser();
const userId    = user.id;
const userName  = user.name;
const email     = user.email;
const roleId    = user.role;
const subsidiary = user.subsidiary;

// Environment
const envType = runtime.envType;   // PRODUCTION | SANDBOX | BETA
const execCtx = runtime.executionContext;  // USERINTERFACE | SCHEDULED | etc.
const isOnline = runtime.isFeatureInEffect({ feature: 'MULTISUBSIDIARY' });
const version  = runtime.version;          // e.g. "2023.1"

// ExecutionContext enum values:
// USERINTERFACE, SUITELET, RESTLET, SCHEDULED, CSVIMPORT,
// WEBAPPLICATION, DEBUGGER, WORKFLOW, WEBSERVICES, PORTLET
```

---

### `N/email` — Send Email

```javascript
email.send({
  author: runtime.getCurrentUser().id,
  recipients: ['manager@example.com'],
  cc: ['finance@example.com'],
  subject: 'Invoice Approved',
  body: 'Invoice #1234 has been approved.',
  attachments: [file.load({ id: 123 })],
  relatedRecords: {
    entityId: customerId,
    transactionId: invoiceId
  }
});

// Bulk/internal
email.sendBulk({
  author: employeeId,
  recipients: [customerId],
  subject: 'Statement',
  body: htmlBody,
  isInternalOnly: false
});
```

---

### `N/file` — File Cabinet

```javascript
// Load a file
const f = file.load({ id: '/SuiteScripts/data.csv' });   // path or internal ID
const content = f.getContents();

// Create a file
const newFile = file.create({
  name: 'report.txt',
  fileType: file.Type.PLAINTEXT,
  contents: 'Hello World',
  folder: -4,   // SuiteScripts folder (-4) or numeric folder ID
  isOnline: false
});
const fileId = newFile.save();

// Delete
file.delete({ id: fileId });

// File types: PLAINTEXT, CSV, JSON, PDF, EXCEL, WORD, PJPG, PNG, ZIP, etc.
```

---

### `N/url` — URL Generation

```javascript
// Suitelet URL
const suiteletUrl = url.resolveScript({
  scriptId: 'customscript_my_suitelet',
  deploymentId: 'customdeploy_my_suitelet',
  returnExternalUrl: false,
  params: { custparam_id: 123 }
});

// Record URL
const recUrl = url.resolveRecord({
  recordType: 'salesorder',
  recordId: 456,
  isEditMode: true
});

// Task URL
const taskUrl = url.resolveTaskLink({ id: url.TaskLinkType.NEW_CUSTOMER });
```

---

### `N/format` — Data Formatting

```javascript
const formatted = format.format({ value: new Date(), type: format.Type.DATE });
const parsed    = format.parse({ value: '01/15/2025', type: format.Type.DATE });

// Currency
const currency  = format.format({ value: 1234.5, type: format.Type.CURRENCY });

// Types: DATE, DATETIME, DATETIMETZ, INTEGER, FLOAT, CURRENCY, PERCENT,
//        CHECKBOX, SELECT, MULTISELECT, TEXT, TEXTAREA, EMAIL, URL, etc.
```

---

### `N/http` & `N/https` — Outbound HTTP

```javascript
// GET
const response = https.get({
  url: 'https://api.example.com/data',
  headers: { Authorization: 'Bearer token123', Accept: 'application/json' }
});
const data = JSON.parse(response.body);

// POST
const postResp = https.post({
  url: 'https://api.example.com/orders',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ orderId: 123, status: 'shipped' })
});

// PUT / DELETE
https.put({ url: '...', headers: {}, body: '...' });
https.delete({ url: '...', headers: {} });

// Request object (more control)
const req = https.createClientRequest({ url: '...' });
// Note: use https for TLS; http for plain HTTP (not recommended in prod)
```

---

### `N/redirect` — Navigation Redirects

```javascript
// In Suitelets / User Event beforeLoad
redirect.toRecord({ type: 'salesorder', id: 123 });
redirect.toSuitelet({ scriptId: 'customscript_x', deploymentId: 'customdeploy_x' });
redirect.toSearchResult({ searchId: 'customsearch_results' });
redirect.toTaskLink({ id: redirect.Task.LIST_CUSTOMER });
redirect.toURL({ url: '/app/accounting/transactions/salesord.nl?id=100' });
```

---

### `N/render` — PDF / HTML Rendering

```javascript
// Render a PDF from a template
const renderer = render.create();
renderer.setTemplateById({ id: 123 });  // or setTemplateByScriptId
renderer.addRecord({ templateName: 'record', record: rec });
renderer.addSearchResults({ templateName: 'results', searchResult: results });
const pdfFile = renderer.renderAsPdf();
pdfFile.save();

// Statement renderer
const statement = render.statement({
  entityId: customerId,
  printMode: render.PrintMode.PDF,
  formId: 123,
  startDate: new Date('2025-01-01'),
  openTransactionsOnly: false
});

// Transaction rendering
render.transaction({ entityId: soId, printMode: render.PrintMode.HTML });
```

---

### `N/task` — Task Scheduling

```javascript
// Schedule a script task
const task = task.create({
  taskType: task.TaskType.SCHEDULED_SCRIPT,
  scriptId: 'customscript_process_orders',
  deploymentId: 'customdeploy_process_orders',
  params: { custscript_start_date: '2025-01-01' }
});
const taskId = task.submit();

// Map/Reduce task
const mrTask = task.create({
  taskType: task.TaskType.MAP_REDUCE,
  scriptId: 'customscript_mr_invoices',
  deploymentId: 'customdeploy_mr_invoices',
  inputValues: {}
});
mrTask.submit();

// Check task status
const status = task.checkStatus({ taskId });
log.debug('Task Status', status.status);
// status.status: PENDING, PROCESSING, COMPLETE, FAILED
```

---

### `N/workflow` — Workflow Operations

```javascript
// Initiate a workflow
const instanceId = workflow.initiate({
  recordType: 'salesorder',
  recordId: 123,
  workflowId: 'customworkflow_approval'  // or internal ID
});

// Trigger a workflow
workflow.trigger({
  recordType: 'salesorder',
  recordId: 123,
  workflowId: 'customworkflow_approval',
  actionId: 123   // workflow action internal ID
});
```

---

### `N/currentRecord` — Client-Side Current Record

Used only in Client Scripts. Provides access to the currently open record in the browser.

```javascript
define(['N/currentRecord'], (currentRecord) => {
  const fieldChanged = (context) => {
    const rec = currentRecord.get();
    const val = rec.getValue({ fieldId: 'amount' });
    rec.setValue({ fieldId: 'memo', value: `Amount is ${val}` });
  };
  return { fieldChanged };
});
```

---

### `N/ui/serverWidget` — Server-Side Form Building

Used in Suitelets and `beforeLoad` User Event scripts.

```javascript
// Create a form
const form = serverWidget.createForm({ title: 'Report Filter' });

// Add field groups
const group = form.addFieldGroup({ id: 'custpage_filters', label: 'Filters' });

// Add fields
const dateField = form.addField({
  id: 'custpage_start_date',
  type: serverWidget.FieldType.DATE,
  label: 'Start Date',
  container: 'custpage_filters'
});
dateField.defaultValue = '01/01/2025';
dateField.isMandatory = true;

// Select field with options
const statusField = form.addField({
  id: 'custpage_status',
  type: serverWidget.FieldType.SELECT,
  label: 'Status'
});
statusField.addSelectOption({ value: '', text: '-- Any --' });
statusField.addSelectOption({ value: 'open', text: 'Open' });
statusField.addSelectOption({ value: 'closed', text: 'Closed' });

// Add sublist
const sublist = form.addSublist({
  id: 'custpage_results',
  type: serverWidget.SublistType.LIST,
  label: 'Results'
});
sublist.addField({ id: 'custpage_id', type: serverWidget.FieldType.TEXT, label: 'ID' });
sublist.addField({ id: 'custpage_name', type: serverWidget.FieldType.TEXT, label: 'Name' });
sublist.addField({ id: 'custpage_total', type: serverWidget.FieldType.CURRENCY, label: 'Total' });

// Populate sublist
sublist.setSublistValue({ id: 'custpage_id', line: 0, value: '1001' });
sublist.setSublistValue({ id: 'custpage_name', line: 0, value: 'Acme Corp' });

// Buttons
form.addSubmitButton({ label: 'Run Report' });
form.addResetButton({ label: 'Reset' });
form.addButton({ id: 'custpage_export', label: 'Export CSV', functionName: 'exportCSV' });

// Client script attachment (loads client script on the form)
form.clientScriptModulePath = './myClientScript.js';

// Tabs
const tab = form.addTab({ id: 'custpage_tab1', label: 'Details' });

context.response.writePage(form);
```

**FieldType constants:**
`TEXT`, `LONGTEXT`, `TEXTAREA`, `INTEGER`, `FLOAT`, `CURRENCY`, `PERCENT`,
`CHECKBOX`, `DATE`, `DATETIME`, `DATETIMETZ`, `EMAIL`, `URL`, `PHONE`,
`SELECT`, `MULTISELECT`, `IMAGE`, `INLINEHTML`, `LABEL`, `RICHTEXT`,
`FILE`, `TIMEOFDAY`, `ADDRESS`.

---

### `N/ui/dialog` — Client-Side Dialog

```javascript
define(['N/ui/dialog'], (dialog) => {
  const pageInit = () => {
    dialog.alert({ title: 'Welcome', message: 'Form loaded.' });

    dialog.confirm({ title: 'Delete?', message: 'Are you sure?' })
      .then((confirmed) => {
        if (confirmed) { /* proceed */ }
      });

    dialog.create({
      title: 'Input Required',
      message: 'Enter a value',
      buttons: [
        { label: 'OK', value: 'confirm' },
        { label: 'Cancel', value: 'cancel' }
      ]
    }).then((result) => {
      if (result === 'confirm') { /* ... */ }
    });
  };
  return { pageInit };
});
```

---

### `N/crypto` — Hashing & Encryption

```javascript
// Create a hash
const hashResult = crypto.createHash({
  algorithm: crypto.HashAlg.SHA256
});
hashResult.update({ input: 'data to hash' });
const hash = hashResult.digest({ outputEncoding: encode.Encoding.HEX });

// HMAC
const hmac = crypto.createHmac({
  algorithm: crypto.HashAlg.SHA256,
  key: crypto.createSecretKey({ secret: 'mySecretKey', encoding: encode.Encoding.UTF_8 })
});
hmac.update({ input: 'message' });
const signature = hmac.digest({ outputEncoding: encode.Encoding.BASE_64 });
```

---

### `N/encode` — Base64 / UTF-8 Encoding

```javascript
const encoded = encode.convert({
  string: 'Hello World',
  inputEncoding: encode.Encoding.UTF_8,
  outputEncoding: encode.Encoding.BASE_64
});
const decoded = encode.convert({
  string: encoded,
  inputEncoding: encode.Encoding.BASE_64,
  outputEncoding: encode.Encoding.UTF_8
});
```

---

### `N/xml` — XML Parsing & Building

```javascript
// Parse XML
const xmlDoc = xml.Parser.fromString({ text: xmlString });
const rootNode = xmlDoc.firstChild;
const elements = xml.XPath.select({ node: xmlDoc, xpath: '//Invoice/Lines/Line' });

// Build XML
const doc = xml.Document.create({ tagName: 'root' });
const child = doc.createElement({ tagName: 'item' });
child.setAttribute({ name: 'id', value: '123' });
doc.documentElement.appendChild({ newChild: child });
const xmlStr = xml.Parser.toString({ document: doc });
```

---

### `N/translation` — i18n (Internationalization)

```javascript
const strings = translation.get({
  collection: 'custcollection_my_strings',
  locale: translation.Locale.CURRENT,
  keys: ['KEY_WELCOME', 'KEY_ERROR']
});
log.debug('Welcome', strings['KEY_WELCOME']);
```

---

### `N/portlet` — Portlet Module

Use to set portlet content in Portlet scripts:
```javascript
context.portlet.setHtml({ html: '<b>Hello World</b>' });
context.portlet.addLine({ text: 'Line 1' });
context.portlet.addForm();
```

---

### `N/suiteAppInfo` — SuiteApp Metadata

```javascript
const appInfo = suiteAppInfo.getSuiteApps({ installedOnly: true });
```

---

## Governance (Usage Units)

Every script has a governance limit. Exceeding it throws `USAGE_LIMIT_EXCEEDED`.

| Operation | Units Used |
|---|---|
| `record.load()` | 10 |
| `record.create()` / `.save()` | 20 |
| `record.submitFields()` | 10 |
| `record.delete()` | 20 |
| `record.copy()` | 10 |
| `record.transform()` | 10 |
| `search.create().run()` | 10 |
| `search.load()` + run | 5 + 10 |
| `.getRange()` (per 1000) | 10 |
| `query.runSuiteQL()` | 10 |
| `https.get/post()` | 10 |
| `email.send()` | 10 |
| `render.*()` | 10 |
| `task.submit()` | 10 |

**Governance limits by script type:**

| Script Type | Limit |
|---|---|
| Client Script | 1,000 |
| User Event | 1,000 |
| Scheduled Script | 10,000 |
| Map/Reduce (per stage) | 10,000 |
| Suitelet | 1,000 |
| RESTlet | 1,000 |
| Portlet | 1,000 |
| Mass Update (per record) | 1,000 |
| Workflow Action | 1,000 |

Check remaining units:
```javascript
runtime.getCurrentScript().getRemainingUsage();
```

---

## Error Handling

```javascript
define(['N/error', 'N/log'], (error, log) => {
  const execute = (context) => {
    try {
      // risky operation
    } catch (e) {
      // SuiteScript errors have .name, .message, .stack
      if (e.name === 'RCRD_DSNT_EXIST') {
        log.error('Record not found', e.message);
      } else {
        // Create and throw a custom error
        throw error.create({
          name: 'VALIDATION_FAILED',
          message: 'Field X must be greater than 0',
          notifyOff: false  // true = suppress email notification
        });
      }
    }
  };
  return { execute };
});
```

**Common Error Names:**
`RCRD_DSNT_EXIST`, `SSS_INVALID_SRCH_OPERATOR`, `UNEXPECTED_ERROR`,
`INSUFFICIENT_PERMISSION`, `USAGE_LIMIT_EXCEEDED`, `SSS_REQUEST_LIMIT_EXCEEDED`,
`INVALID_KEY_OR_REF`, `TYPE_MISMATCH`, `SSS_MISSING_REQD_ARGUMENT`.

---

## Custom Fields

Custom field IDs always start with `custbody_`, `custcol_`, `custentity_`, `custitem_`, `custrecord_`, `custpage_`, etc.

```javascript
// Body field
rec.getValue({ fieldId: 'custbody_po_number' });
rec.setValue({ fieldId: 'custbody_approval_flag', value: true });

// Sublist column
rec.getSublistValue({ sublistId: 'item', fieldId: 'custcol_notes', line: 0 });

// Entity field
rec.getValue({ fieldId: 'custentity_tax_id' });

// Record-level custom record
record.load({ type: 'customrecord_project', id: 10 });
```

---

## Script Parameters

Defined on the Script record in NetSuite. Accessed via:

```javascript
const param = runtime.getCurrentScript().getParameter({ name: 'custscript_param_name' });
```

Parameter types: `text`, `integer`, `float`, `currency`, `select`, `multiselect`,
`checkbox`, `date`, `datetime`, `document` (file), `email`, `free_form_text`,
`textarea`, `url`, `percent`, `password`, `record`.

---

## Custom Records

```javascript
// Create custom record
const customRec = record.create({ type: 'customrecord_my_type', isDynamic: true });
customRec.setValue({ fieldId: 'name', value: 'Test Record' });
customRec.setValue({ fieldId: 'custrecord_status', value: 2 });
const recId = customRec.save();

// Search custom record
search.create({
  type: 'customrecord_my_type',
  filters: [['custrecord_status', 'anyof', '2']],
  columns: ['internalid', 'name', 'custrecord_status']
}).run().getRange({ start: 0, end: 100 });
```

---

## SuiteScript 2.x Patterns & Best Practices

### Pattern 1: Safe Bulk Processing with Governance Check

```javascript
const processRecords = (ids) => {
  const script = runtime.getCurrentScript();
  ids.forEach((id) => {
    if (script.getRemainingUsage() < 200) {
      // Schedule continuation task
      task.create({
        taskType: task.TaskType.SCHEDULED_SCRIPT,
        scriptId: script.id,
        deploymentId: script.deploymentId,
        params: { custscript_remaining_ids: JSON.stringify(ids.slice(ids.indexOf(id))) }
      }).submit();
      return;
    }
    // process record
    record.submitFields({ type: 'salesorder', id, values: { status: 'closed' } });
  });
};
```

### Pattern 2: Search-All Results (> 1000)

```javascript
const getAllResults = (searchObj) => {
  const all = [];
  const paged = searchObj.runPaged({ pageSize: 1000 });
  paged.pageRanges.forEach((range) => {
    paged.fetch({ index: range.index }).data.forEach((r) => all.push(r));
  });
  return all;
};
```

### Pattern 3: Dynamic vs Static Record Mode

```javascript
// Static mode: efficient reads, array-style sublist access
// Use when: reading data or making simple field updates
const staticRec = record.load({ type: 'salesorder', id: 1, isDynamic: false });

// Dynamic mode: mimics UI workflow (triggers sourcing, validation)
// Use when: creating records that source data from related records
const dynamicRec = record.load({ type: 'salesorder', id: 1, isDynamic: true });
```

### Pattern 4: RESTlet Authentication (Token-Based Auth)

External systems call RESTlets using TBA (Token-Based Authentication):
```
Authorization: OAuth realm="<account_id>",
  oauth_consumer_key="<key>",
  oauth_token="<token>",
  oauth_signature_method="HMAC-SHA256",
  oauth_timestamp="...",
  oauth_nonce="...",
  oauth_version="1.0",
  oauth_signature="<sig>"
```

### Pattern 5: Inline HTML Field in Suitelet

```javascript
const htmlField = form.addField({
  id: 'custpage_html',
  type: serverWidget.FieldType.INLINEHTML,
  label: 'Info'
});
htmlField.defaultValue = '<div style="color:red">Alert!</div>';
```

### Pattern 6: Client Script + Suitelet Roundtrip

```javascript
// In Client Script: call Suitelet via https
define(['N/https', 'N/url'], (https, url) => {
  const pageInit = (context) => {
    const suiteletUrl = url.resolveScript({
      scriptId: 'customscript_data_suitelet',
      deploymentId: 'customdeploy_data_suitelet',
      returnExternalUrl: false
    });
    const resp = https.get({ url: suiteletUrl + '&custparam_id=123' });
    const data = JSON.parse(resp.body);
    console.log(data);
  };
  return { pageInit };
});
```

---

## Complete Application Example: PO Approval Workflow Script Suite

### Scenario
Automate purchase order approval: notify approver on creation, allow approval from a custom Suitelet, update PO status.

### File 1: `UE_PO_Approval_Notify.js` (User Event)
```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/email', 'N/record', 'N/search', 'N/url', 'N/runtime', 'N/log'],
  (email, record, search, url, runtime, log) => {

  const afterSubmit = (context) => {
    if (context.type !== context.UserEventType.CREATE) return;

    const po = context.newRecord;
    const total = po.getValue('total');
    const memo  = po.getValue('memo');
    const poId  = po.id;

    // Find approver from custom field
    const approverId = po.getValue('custbody_approver');
    if (!approverId) return;

    // Build approval Suitelet URL
    const approvalUrl = url.resolveScript({
      scriptId:    'customscript_po_approval_suitelet',
      deploymentId:'customdeploy_po_approval_suitelet',
      returnExternalUrl: true,
      params: { custparam_poid: poId }
    });

    email.send({
      author: runtime.getCurrentUser().id,
      recipients: [approverId],
      subject: `PO Approval Required: ${po.getValue('tranid')}`,
      body: `
        <p>A Purchase Order requires your approval:</p>
        <ul>
          <li>PO #: ${po.getValue('tranid')}</li>
          <li>Total: $${total}</li>
          <li>Memo: ${memo}</li>
        </ul>
        <p><a href="${approvalUrl}">Click here to approve or reject</a></p>
      `
    });

    log.audit('PO Notification', `Approval email sent for PO ${poId} to approver ${approverId}`);
  };

  return { afterSubmit };
});
```

### File 2: `SL_PO_Approval.js` (Suitelet)
```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget', 'N/record', 'N/redirect', 'N/log', 'N/runtime'],
  (serverWidget, record, redirect, log, runtime) => {

  const onRequest = (context) => {
    const { method, parameters } = context.request;
    const poId = parameters.custparam_poid;

    if (method === 'GET') {
      // Load PO and display approval form
      const po = record.load({ type: record.Type.PURCHASE_ORDER, id: parseInt(poId) });
      const form = serverWidget.createForm({ title: 'Purchase Order Approval' });

      // Display PO info
      const info = form.addField({
        id: 'custpage_info',
        type: serverWidget.FieldType.INLINEHTML,
        label: 'Details'
      });
      info.defaultValue = `
        <table>
          <tr><td><b>PO #:</b></td><td>${po.getValue('tranid')}</td></tr>
          <tr><td><b>Total:</b></td><td>$${po.getValue('total')}</td></tr>
          <tr><td><b>Vendor:</b></td><td>${po.getText('entity')}</td></tr>
          <tr><td><b>Memo:</b></td><td>${po.getValue('memo') || ''}</td></tr>
        </table>
      `;

      form.addField({ id: 'custpage_poid', type: serverWidget.FieldType.HIDDEN, label: 'PO ID' })
          .defaultValue = poId;

      const notes = form.addField({
        id: 'custpage_notes',
        type: serverWidget.FieldType.TEXTAREA,
        label: 'Notes'
      });

      form.addButton({ id: 'custpage_approve', label: 'Approve',
                       functionName: `document.getElementById('custpage_action').value='approve';document.forms[0].submit()` });
      form.addButton({ id: 'custpage_reject',  label: 'Reject',
                       functionName: `document.getElementById('custpage_action').value='reject';document.forms[0].submit()` });
      form.addField({ id: 'custpage_action', type: serverWidget.FieldType.HIDDEN, label: 'Action' });

      context.response.writePage(form);

    } else {
      // POST: process approval/rejection
      const action = parameters.custpage_action;
      const notes  = parameters.custpage_notes;

      const newStatus = action === 'approve' ? 'Approved' : 'Rejected';

      record.submitFields({
        type: record.Type.PURCHASE_ORDER,
        id: parseInt(poId),
        values: {
          custbody_approval_status: newStatus,
          custbody_approval_notes:  notes,
          approvalstatus: action === 'approve' ? '2' : '3'
        }
      });

      log.audit('PO Approval', `PO ${poId} ${newStatus} by user ${runtime.getCurrentUser().id}`);
      context.response.write(`<h2>Purchase Order ${newStatus}</h2><p>You may close this window.</p>`);
    }
  };

  return { onRequest };
});
```

### File 3: `SS_PO_Reminder.js` (Scheduled Script)
```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['N/search', 'N/email', 'N/runtime', 'N/log'],
  (search, email, runtime, log) => {

  const execute = (context) => {
    // Find pending POs older than 3 days
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 3);

    const results = search.create({
      type: search.Type.PURCHASE_ORDER,
      filters: [
        ['custbody_approval_status', search.Operator.IS, 'Pending'],
        'AND',
        ['datecreated', search.Operator.BEFORE, cutoff]
      ],
      columns: ['tranid', 'entity', 'total', 'custbody_approver', 'datecreated']
    }).run().getRange({ start: 0, end: 1000 });

    results.forEach((r) => {
      if (runtime.getCurrentScript().getRemainingUsage() < 100) {
        log.error('Governance', 'Stopping due to low governance units');
        return;
      }
      const approverId = r.getValue('custbody_approver');
      if (!approverId) return;

      email.send({
        author: runtime.getCurrentUser().id,
        recipients: [parseInt(approverId)],
        subject: `REMINDER: PO Awaiting Approval - ${r.getValue('tranid')}`,
        body: `PO ${r.getValue('tranid')} (Total: $${r.getValue('total')}) is still pending your approval.`
      });
      log.audit('Reminder Sent', `PO ${r.getValue('tranid')} to approver ${approverId}`);
    });
  };

  return { execute };
});
```

---

## Deployment Configuration

Script deployments are configured in NetSuite UI under:
**Customization > Scripting > Scripts > [Script] > Deployments**

Key deployment settings:
- **Status**: `Released` (runs) or `Not Released` (disabled)
- **Execute As Role**: Run as a specific role (e.g., Administrator) regardless of logged-in user
- **Log Level**: DEBUG / AUDIT / ERROR / EMERGENCY (filters execution log)
- **Audience**: Which roles/employees can access (for Suitelets)
- **Schedule**: Cron expression for Scheduled Scripts (e.g., `0 8 * * *` = 8am daily)
- **Queue**: For Map/Reduce — which SuiteScript queue to use (1–5)

---

## Common SuiteQL Examples

```sql
-- Open Sales Orders with customer info
SELECT t.id, t.tranid, t.trandate, e.companyname, t.foreigntotal
FROM transaction t
JOIN entity e ON e.id = t.entity
WHERE t.recordtype = 'salesorder'
  AND t.orderstatus NOT IN ('H', 'C')
ORDER BY t.trandate DESC

-- Inventory by location
SELECT i.id, i.itemid, i.displayname, il.locationquantityonhand, il.locationquantityavailable
FROM item i
JOIN inventoryitemlocations il ON il.item = i.id
WHERE i.isinactive = 'F'
  AND il.location = 1

-- Transaction lines with account
SELECT t.tranid, tl.memo, tl.debit, tl.credit, a.acctnumber, a.acctname
FROM transaction t
JOIN transactionline tl ON tl.transaction = t.id
JOIN account a ON a.id = tl.account
WHERE t.trandate BETWEEN TO_DATE('2025-01-01','YYYY-MM-DD')
                      AND TO_DATE('2025-12-31','YYYY-MM-DD')
  AND t.recordtype = 'journalentry'

-- Employee expense totals by department
SELECT d.name AS department, e.firstname || ' ' || e.lastname AS employee,
       SUM(tl.amount) AS total_expenses
FROM transaction t
JOIN transactionline tl ON tl.transaction = t.id
JOIN employee e ON e.id = t.entity
JOIN department d ON d.id = e.department
WHERE t.recordtype = 'expensereport'
  AND t.trandate >= TO_DATE('2025-01-01','YYYY-MM-DD')
GROUP BY d.name, e.firstname, e.lastname
ORDER BY total_expenses DESC
```

---

## Workflow

When asked to create a SuiteScript solution:

1. **Identify the script type** — What trigger? (record save → User Event, UI interaction → Client Script or Suitelet, scheduled processing → Scheduled/Map-Reduce, external API → RESTlet)
2. **Check governance** — Bulk ops need Scheduled/Map-Reduce; UI actions need Client/Suitelet
3. **Write the `@NApiVersion 2.1` header** and correct `@NScriptType`
4. **Use `define()`** with only required module dependencies
5. **Return only the entry point functions** the script type needs
6. **Add error handling** with try/catch for record operations
7. **Log with `N/log`** — use `log.debug` in development, `log.audit` for business events
8. **Check governance** before processing loops with `getRemainingUsage()`
9. **Use `record.submitFields`** instead of load+save when only updating a few fields
10. **Use `search.runPaged`** for large result sets rather than `getRange`

---

## Quick Reference: Module → Use Case

| Need | Module |
|---|---|
| Create/read/update/delete records | `N/record` |
| Search records | `N/search` |
| SQL-style queries | `N/query` |
| Log messages | `N/log` |
| Script params, user, environment | `N/runtime` |
| Send email | `N/email` |
| Read/write files | `N/file` |
| Build forms and pages | `N/ui/serverWidget` |
| Browser dialogs | `N/ui/dialog` |
| Navigate / redirect | `N/redirect` |
| Generate URLs | `N/url` |
| Format dates, numbers | `N/format` |
| Call external APIs | `N/https` |
| Render PDFs | `N/render` |
| Schedule tasks | `N/task` |
| Trigger workflows | `N/workflow` |
| Hash/encrypt data | `N/crypto` |
| Encode/decode data | `N/encode` |
| Parse XML | `N/xml` |
| Access current record (client) | `N/currentRecord` |
| Internationalization | `N/translation` |
