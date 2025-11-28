/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 *
 * NetSuite Saved Search Utility
 * This script demonstrates how to use the N/search module to create
 * and run saved searches for various record types.
 *
 * Deploy as a Suitelet to run on-demand searches
 */

define(['N/search', 'N/log', 'N/ui/serverWidget', 'N/runtime'], function(search, log, serverWidget, runtime) {

    /**
     * Definition of the Suitelet script trigger point.
     * @param {Object} context
     * @param {ServerRequest} context.request - Incoming request
     * @param {ServerResponse} context.response - Response object
     */
    function onRequest(context) {
        if (context.request.method === 'GET') {
            displaySearchForm(context);
        } else {
            executeSearch(context);
        }
    }

    /**
     * Display the search form
     */
    function displaySearchForm(context) {
        var form = serverWidget.createForm({
            title: 'NetSuite Saved Search Utility'
        });

        var recordTypeField = form.addField({
            id: 'custpage_record_type',
            type: serverWidget.FieldType.SELECT,
            label: 'Record Type'
        });

        // Add common record types
        recordTypeField.addSelectOption({ value: '', text: '-- Select --' });
        recordTypeField.addSelectOption({ value: 'customer', text: 'Customer' });
        recordTypeField.addSelectOption({ value: 'salesorder', text: 'Sales Order' });
        recordTypeField.addSelectOption({ value: 'invoice', text: 'Invoice' });
        recordTypeField.addSelectOption({ value: 'purchaseorder', text: 'Purchase Order' });
        recordTypeField.addSelectOption({ value: 'vendor', text: 'Vendor' });
        recordTypeField.addSelectOption({ value: 'employee', text: 'Employee' });
        recordTypeField.addSelectOption({ value: 'item', text: 'Item' });
        recordTypeField.addSelectOption({ value: 'transaction', text: 'All Transactions' });
        recordTypeField.addSelectOption({ value: 'contact', text: 'Contact' });
        recordTypeField.addSelectOption({ value: 'opportunity', text: 'Opportunity' });
        recordTypeField.addSelectOption({ value: 'case', text: 'Support Case' });
        recordTypeField.addSelectOption({ value: 'task', text: 'Task' });
        recordTypeField.addSelectOption({ value: 'calendarevent', text: 'Calendar Event' });
        recordTypeField.addSelectOption({ value: 'phonecall', text: 'Phone Call' });
        recordTypeField.addSelectOption({ value: 'lead', text: 'Lead' });
        recordTypeField.addSelectOption({ value: 'prospect', text: 'Prospect' });

        form.addSubmitButton({
            label: 'Run Search'
        });

        context.response.writePage(form);
    }

    /**
     * Execute the search based on selected record type
     */
    function executeSearch(context) {
        var recordType = context.request.parameters.custpage_record_type;
        var searchResults = [];

        try {
            var searchObj = createSearch(recordType);

            if (searchObj) {
                var pagedData = searchObj.runPaged({ pageSize: 100 });

                pagedData.pageRanges.forEach(function(pageRange) {
                    var page = pagedData.fetch({ index: pageRange.index });
                    page.data.forEach(function(result) {
                        searchResults.push(formatResult(result, recordType));
                    });
                });
            }

            displayResults(context, recordType, searchResults);

        } catch (e) {
            log.error({
                title: 'Search Error',
                details: e.message
            });
            context.response.write('Error executing search: ' + e.message);
        }
    }

    /**
     * Create a search based on record type with all applicable fields
     */
    function createSearch(recordType) {
        var searchConfig = getSearchConfig(recordType);

        if (!searchConfig) {
            return null;
        }

        return search.create({
            type: searchConfig.type,
            filters: searchConfig.filters,
            columns: searchConfig.columns
        });
    }

    /**
     * Get search configuration for each record type
     * Returns filters and columns appropriate for each type
     */
    function getSearchConfig(recordType) {
        var configs = {

            // ============================================
            // CUSTOMER SEARCH
            // ============================================
            'customer': {
                type: search.Type.CUSTOMER,
                filters: [
                    ['isinactive', 'is', 'F']
                ],
                columns: [
                    search.createColumn({ name: 'internalid', label: 'Internal ID' }),
                    search.createColumn({ name: 'entityid', label: 'Customer ID' }),
                    search.createColumn({ name: 'companyname', label: 'Company Name' }),
                    search.createColumn({ name: 'firstname', label: 'First Name' }),
                    search.createColumn({ name: 'lastname', label: 'Last Name' }),
                    search.createColumn({ name: 'email', label: 'Email' }),
                    search.createColumn({ name: 'phone', label: 'Phone' }),
                    search.createColumn({ name: 'altphone', label: 'Alt Phone' }),
                    search.createColumn({ name: 'fax', label: 'Fax' }),
                    search.createColumn({ name: 'address', label: 'Address' }),
                    search.createColumn({ name: 'city', label: 'City' }),
                    search.createColumn({ name: 'state', label: 'State' }),
                    search.createColumn({ name: 'zipcode', label: 'Zip Code' }),
                    search.createColumn({ name: 'country', label: 'Country' }),
                    search.createColumn({ name: 'category', label: 'Category' }),
                    search.createColumn({ name: 'salesrep', label: 'Sales Rep' }),
                    search.createColumn({ name: 'territory', label: 'Territory' }),
                    search.createColumn({ name: 'pricelevel', label: 'Price Level' }),
                    search.createColumn({ name: 'terms', label: 'Terms' }),
                    search.createColumn({ name: 'creditlimit', label: 'Credit Limit' }),
                    search.createColumn({ name: 'balance', label: 'Balance' }),
                    search.createColumn({ name: 'overduebalance', label: 'Overdue Balance' }),
                    search.createColumn({ name: 'depositbalance', label: 'Deposit Balance' }),
                    search.createColumn({ name: 'unbilledorders', label: 'Unbilled Orders' }),
                    search.createColumn({ name: 'currency', label: 'Currency' }),
                    search.createColumn({ name: 'subsidiary', label: 'Subsidiary' }),
                    search.createColumn({ name: 'datecreated', label: 'Date Created' }),
                    search.createColumn({ name: 'lastmodifieddate', label: 'Last Modified' }),
                    search.createColumn({ name: 'isinactive', label: 'Inactive' }),
                    search.createColumn({ name: 'custentity_custom_field', label: 'Custom Field' }) // Example custom field
                ]
            },

            // ============================================
            // SALES ORDER SEARCH
            // ============================================
            'salesorder': {
                type: search.Type.SALES_ORDER,
                filters: [
                    ['mainline', 'is', 'T']
                ],
                columns: [
                    search.createColumn({ name: 'internalid', label: 'Internal ID' }),
                    search.createColumn({ name: 'tranid', label: 'Document Number' }),
                    search.createColumn({ name: 'trandate', sort: search.Sort.DESC, label: 'Date' }),
                    search.createColumn({ name: 'entity', label: 'Customer' }),
                    search.createColumn({ name: 'status', label: 'Status' }),
                    search.createColumn({ name: 'statusref', label: 'Status Ref' }),
                    search.createColumn({ name: 'amount', label: 'Amount' }),
                    search.createColumn({ name: 'total', label: 'Total' }),
                    search.createColumn({ name: 'taxtotal', label: 'Tax Total' }),
                    search.createColumn({ name: 'shippingcost', label: 'Shipping Cost' }),
                    search.createColumn({ name: 'discountamount', label: 'Discount Amount' }),
                    search.createColumn({ name: 'subtotal', label: 'Subtotal' }),
                    search.createColumn({ name: 'currency', label: 'Currency' }),
                    search.createColumn({ name: 'exchangerate', label: 'Exchange Rate' }),
                    search.createColumn({ name: 'salesrep', label: 'Sales Rep' }),
                    search.createColumn({ name: 'department', label: 'Department' }),
                    search.createColumn({ name: 'class', label: 'Class' }),
                    search.createColumn({ name: 'location', label: 'Location' }),
                    search.createColumn({ name: 'subsidiary', label: 'Subsidiary' }),
                    search.createColumn({ name: 'terms', label: 'Terms' }),
                    search.createColumn({ name: 'duedate', label: 'Due Date' }),
                    search.createColumn({ name: 'shipdate', label: 'Ship Date' }),
                    search.createColumn({ name: 'shipmethod', label: 'Ship Method' }),
                    search.createColumn({ name: 'shipaddress', label: 'Ship Address' }),
                    search.createColumn({ name: 'billaddress', label: 'Bill Address' }),
                    search.createColumn({ name: 'memo', label: 'Memo' }),
                    search.createColumn({ name: 'otherrefnum', label: 'PO/Check Number' }),
                    search.createColumn({ name: 'custbody_custom_field', label: 'Custom Body Field' }) // Example
                ]
            },

            // ============================================
            // INVOICE SEARCH
            // ============================================
            'invoice': {
                type: search.Type.INVOICE,
                filters: [
                    ['mainline', 'is', 'T']
                ],
                columns: [
                    search.createColumn({ name: 'internalid', label: 'Internal ID' }),
                    search.createColumn({ name: 'tranid', label: 'Invoice Number' }),
                    search.createColumn({ name: 'trandate', sort: search.Sort.DESC, label: 'Date' }),
                    search.createColumn({ name: 'entity', label: 'Customer' }),
                    search.createColumn({ name: 'status', label: 'Status' }),
                    search.createColumn({ name: 'statusref', label: 'Status Ref' }),
                    search.createColumn({ name: 'amount', label: 'Amount' }),
                    search.createColumn({ name: 'total', label: 'Total' }),
                    search.createColumn({ name: 'amountpaid', label: 'Amount Paid' }),
                    search.createColumn({ name: 'amountremaining', label: 'Amount Remaining' }),
                    search.createColumn({ name: 'taxtotal', label: 'Tax Total' }),
                    search.createColumn({ name: 'subtotal', label: 'Subtotal' }),
                    search.createColumn({ name: 'discountamount', label: 'Discount' }),
                    search.createColumn({ name: 'currency', label: 'Currency' }),
                    search.createColumn({ name: 'exchangerate', label: 'Exchange Rate' }),
                    search.createColumn({ name: 'duedate', label: 'Due Date' }),
                    search.createColumn({ name: 'closedate', label: 'Close Date' }),
                    search.createColumn({ name: 'terms', label: 'Terms' }),
                    search.createColumn({ name: 'salesrep', label: 'Sales Rep' }),
                    search.createColumn({ name: 'department', label: 'Department' }),
                    search.createColumn({ name: 'class', label: 'Class' }),
                    search.createColumn({ name: 'location', label: 'Location' }),
                    search.createColumn({ name: 'subsidiary', label: 'Subsidiary' }),
                    search.createColumn({ name: 'memo', label: 'Memo' }),
                    search.createColumn({ name: 'otherrefnum', label: 'PO/Check Number' }),
                    search.createColumn({ name: 'createdfrom', label: 'Created From' }),
                    search.createColumn({ name: 'billaddress', label: 'Billing Address' }),
                    search.createColumn({ name: 'shipaddress', label: 'Shipping Address' })
                ]
            },

            // ============================================
            // PURCHASE ORDER SEARCH
            // ============================================
            'purchaseorder': {
                type: search.Type.PURCHASE_ORDER,
                filters: [
                    ['mainline', 'is', 'T']
                ],
                columns: [
                    search.createColumn({ name: 'internalid', label: 'Internal ID' }),
                    search.createColumn({ name: 'tranid', label: 'PO Number' }),
                    search.createColumn({ name: 'trandate', sort: search.Sort.DESC, label: 'Date' }),
                    search.createColumn({ name: 'entity', label: 'Vendor' }),
                    search.createColumn({ name: 'status', label: 'Status' }),
                    search.createColumn({ name: 'statusref', label: 'Status Ref' }),
                    search.createColumn({ name: 'amount', label: 'Amount' }),
                    search.createColumn({ name: 'total', label: 'Total' }),
                    search.createColumn({ name: 'taxtotal', label: 'Tax Total' }),
                    search.createColumn({ name: 'subtotal', label: 'Subtotal' }),
                    search.createColumn({ name: 'currency', label: 'Currency' }),
                    search.createColumn({ name: 'exchangerate', label: 'Exchange Rate' }),
                    search.createColumn({ name: 'terms', label: 'Terms' }),
                    search.createColumn({ name: 'duedate', label: 'Due Date' }),
                    search.createColumn({ name: 'expectedreceiptdate', label: 'Expected Receipt' }),
                    search.createColumn({ name: 'shipdate', label: 'Ship Date' }),
                    search.createColumn({ name: 'department', label: 'Department' }),
                    search.createColumn({ name: 'class', label: 'Class' }),
                    search.createColumn({ name: 'location', label: 'Location' }),
                    search.createColumn({ name: 'subsidiary', label: 'Subsidiary' }),
                    search.createColumn({ name: 'employee', label: 'Employee' }),
                    search.createColumn({ name: 'approvalstatus', label: 'Approval Status' }),
                    search.createColumn({ name: 'memo', label: 'Memo' }),
                    search.createColumn({ name: 'shipaddress', label: 'Ship To Address' })
                ]
            },

            // ============================================
            // VENDOR SEARCH
            // ============================================
            'vendor': {
                type: search.Type.VENDOR,
                filters: [
                    ['isinactive', 'is', 'F']
                ],
                columns: [
                    search.createColumn({ name: 'internalid', label: 'Internal ID' }),
                    search.createColumn({ name: 'entityid', label: 'Vendor ID' }),
                    search.createColumn({ name: 'companyname', label: 'Company Name' }),
                    search.createColumn({ name: 'legalname', label: 'Legal Name' }),
                    search.createColumn({ name: 'firstname', label: 'First Name' }),
                    search.createColumn({ name: 'lastname', label: 'Last Name' }),
                    search.createColumn({ name: 'email', label: 'Email' }),
                    search.createColumn({ name: 'phone', label: 'Phone' }),
                    search.createColumn({ name: 'altphone', label: 'Alt Phone' }),
                    search.createColumn({ name: 'fax', label: 'Fax' }),
                    search.createColumn({ name: 'address', label: 'Address' }),
                    search.createColumn({ name: 'city', label: 'City' }),
                    search.createColumn({ name: 'state', label: 'State' }),
                    search.createColumn({ name: 'zipcode', label: 'Zip Code' }),
                    search.createColumn({ name: 'country', label: 'Country' }),
                    search.createColumn({ name: 'category', label: 'Category' }),
                    search.createColumn({ name: 'terms', label: 'Terms' }),
                    search.createColumn({ name: 'creditlimit', label: 'Credit Limit' }),
                    search.createColumn({ name: 'balance', label: 'Balance' }),
                    search.createColumn({ name: 'unbilledorders', label: 'Unbilled Orders' }),
                    search.createColumn({ name: 'currency', label: 'Currency' }),
                    search.createColumn({ name: 'subsidiary', label: 'Subsidiary' }),
                    search.createColumn({ name: 'taxidnum', label: 'Tax ID' }),
                    search.createColumn({ name: 'is1099eligible', label: '1099 Eligible' }),
                    search.createColumn({ name: 'datecreated', label: 'Date Created' }),
                    search.createColumn({ name: 'lastmodifieddate', label: 'Last Modified' }),
                    search.createColumn({ name: 'isinactive', label: 'Inactive' })
                ]
            },

            // ============================================
            // EMPLOYEE SEARCH
            // ============================================
            'employee': {
                type: search.Type.EMPLOYEE,
                filters: [
                    ['isinactive', 'is', 'F']
                ],
                columns: [
                    search.createColumn({ name: 'internalid', label: 'Internal ID' }),
                    search.createColumn({ name: 'entityid', label: 'Employee ID' }),
                    search.createColumn({ name: 'firstname', label: 'First Name' }),
                    search.createColumn({ name: 'lastname', label: 'Last Name' }),
                    search.createColumn({ name: 'email', label: 'Email' }),
                    search.createColumn({ name: 'phone', label: 'Phone' }),
                    search.createColumn({ name: 'mobilephone', label: 'Mobile Phone' }),
                    search.createColumn({ name: 'homephone', label: 'Home Phone' }),
                    search.createColumn({ name: 'title', label: 'Job Title' }),
                    search.createColumn({ name: 'supervisor', label: 'Supervisor' }),
                    search.createColumn({ name: 'department', label: 'Department' }),
                    search.createColumn({ name: 'class', label: 'Class' }),
                    search.createColumn({ name: 'location', label: 'Location' }),
                    search.createColumn({ name: 'subsidiary', label: 'Subsidiary' }),
                    search.createColumn({ name: 'hiredate', label: 'Hire Date' }),
                    search.createColumn({ name: 'releasedate', label: 'Release Date' }),
                    search.createColumn({ name: 'billpay', label: 'Bill Pay' }),
                    search.createColumn({ name: 'issalesrep', label: 'Is Sales Rep' }),
                    search.createColumn({ name: 'issupportrep', label: 'Is Support Rep' }),
                    search.createColumn({ name: 'datecreated', label: 'Date Created' }),
                    search.createColumn({ name: 'lastmodifieddate', label: 'Last Modified' }),
                    search.createColumn({ name: 'isinactive', label: 'Inactive' })
                ]
            },

            // ============================================
            // ITEM SEARCH
            // ============================================
            'item': {
                type: search.Type.ITEM,
                filters: [
                    ['isinactive', 'is', 'F']
                ],
                columns: [
                    search.createColumn({ name: 'internalid', label: 'Internal ID' }),
                    search.createColumn({ name: 'itemid', label: 'Item Name/Number' }),
                    search.createColumn({ name: 'displayname', label: 'Display Name' }),
                    search.createColumn({ name: 'salesdescription', label: 'Sales Description' }),
                    search.createColumn({ name: 'purchasedescription', label: 'Purchase Description' }),
                    search.createColumn({ name: 'type', label: 'Type' }),
                    search.createColumn({ name: 'baseprice', label: 'Base Price' }),
                    search.createColumn({ name: 'cost', label: 'Cost' }),
                    search.createColumn({ name: 'averagecost', label: 'Average Cost' }),
                    search.createColumn({ name: 'lastpurchaseprice', label: 'Last Purchase Price' }),
                    search.createColumn({ name: 'quantityonhand', label: 'Quantity On Hand' }),
                    search.createColumn({ name: 'quantityavailable', label: 'Quantity Available' }),
                    search.createColumn({ name: 'quantityonorder', label: 'Quantity On Order' }),
                    search.createColumn({ name: 'quantitybackordered', label: 'Quantity Backordered' }),
                    search.createColumn({ name: 'quantitycommitted', label: 'Quantity Committed' }),
                    search.createColumn({ name: 'reorderpoint', label: 'Reorder Point' }),
                    search.createColumn({ name: 'preferredlocation', label: 'Preferred Location' }),
                    search.createColumn({ name: 'vendor', label: 'Preferred Vendor' }),
                    search.createColumn({ name: 'class', label: 'Class' }),
                    search.createColumn({ name: 'department', label: 'Department' }),
                    search.createColumn({ name: 'location', label: 'Location' }),
                    search.createColumn({ name: 'subsidiary', label: 'Subsidiary' }),
                    search.createColumn({ name: 'upccode', label: 'UPC Code' }),
                    search.createColumn({ name: 'weight', label: 'Weight' }),
                    search.createColumn({ name: 'weightunit', label: 'Weight Unit' }),
                    search.createColumn({ name: 'taxschedule', label: 'Tax Schedule' }),
                    search.createColumn({ name: 'created', label: 'Date Created' }),
                    search.createColumn({ name: 'modified', label: 'Last Modified' }),
                    search.createColumn({ name: 'isinactive', label: 'Inactive' })
                ]
            },

            // ============================================
            // ALL TRANSACTIONS SEARCH
            // ============================================
            'transaction': {
                type: search.Type.TRANSACTION,
                filters: [
                    ['mainline', 'is', 'T']
                ],
                columns: [
                    search.createColumn({ name: 'internalid', label: 'Internal ID' }),
                    search.createColumn({ name: 'type', label: 'Type' }),
                    search.createColumn({ name: 'tranid', label: 'Document Number' }),
                    search.createColumn({ name: 'trandate', sort: search.Sort.DESC, label: 'Date' }),
                    search.createColumn({ name: 'postingperiod', label: 'Period' }),
                    search.createColumn({ name: 'entity', label: 'Name' }),
                    search.createColumn({ name: 'account', label: 'Account' }),
                    search.createColumn({ name: 'status', label: 'Status' }),
                    search.createColumn({ name: 'amount', label: 'Amount' }),
                    search.createColumn({ name: 'netamount', label: 'Net Amount' }),
                    search.createColumn({ name: 'grossamount', label: 'Gross Amount' }),
                    search.createColumn({ name: 'fxamount', label: 'FX Amount' }),
                    search.createColumn({ name: 'currency', label: 'Currency' }),
                    search.createColumn({ name: 'exchangerate', label: 'Exchange Rate' }),
                    search.createColumn({ name: 'department', label: 'Department' }),
                    search.createColumn({ name: 'class', label: 'Class' }),
                    search.createColumn({ name: 'location', label: 'Location' }),
                    search.createColumn({ name: 'subsidiary', label: 'Subsidiary' }),
                    search.createColumn({ name: 'memo', label: 'Memo' }),
                    search.createColumn({ name: 'createdby', label: 'Created By' }),
                    search.createColumn({ name: 'datecreated', label: 'Date Created' }),
                    search.createColumn({ name: 'lastmodifieddate', label: 'Last Modified' })
                ]
            },

            // ============================================
            // CONTACT SEARCH
            // ============================================
            'contact': {
                type: search.Type.CONTACT,
                filters: [
                    ['isinactive', 'is', 'F']
                ],
                columns: [
                    search.createColumn({ name: 'internalid', label: 'Internal ID' }),
                    search.createColumn({ name: 'entityid', label: 'Contact ID' }),
                    search.createColumn({ name: 'firstname', label: 'First Name' }),
                    search.createColumn({ name: 'lastname', label: 'Last Name' }),
                    search.createColumn({ name: 'middlename', label: 'Middle Name' }),
                    search.createColumn({ name: 'salutation', label: 'Salutation' }),
                    search.createColumn({ name: 'title', label: 'Job Title' }),
                    search.createColumn({ name: 'company', label: 'Company' }),
                    search.createColumn({ name: 'email', label: 'Email' }),
                    search.createColumn({ name: 'phone', label: 'Phone' }),
                    search.createColumn({ name: 'mobilephone', label: 'Mobile Phone' }),
                    search.createColumn({ name: 'homephone', label: 'Home Phone' }),
                    search.createColumn({ name: 'officephone', label: 'Office Phone' }),
                    search.createColumn({ name: 'fax', label: 'Fax' }),
                    search.createColumn({ name: 'address', label: 'Address' }),
                    search.createColumn({ name: 'city', label: 'City' }),
                    search.createColumn({ name: 'state', label: 'State' }),
                    search.createColumn({ name: 'zipcode', label: 'Zip Code' }),
                    search.createColumn({ name: 'country', label: 'Country' }),
                    search.createColumn({ name: 'subsidiary', label: 'Subsidiary' }),
                    search.createColumn({ name: 'datecreated', label: 'Date Created' }),
                    search.createColumn({ name: 'lastmodifieddate', label: 'Last Modified' }),
                    search.createColumn({ name: 'isinactive', label: 'Inactive' })
                ]
            },

            // ============================================
            // OPPORTUNITY SEARCH
            // ============================================
            'opportunity': {
                type: search.Type.OPPORTUNITY,
                filters: [
                    ['mainline', 'is', 'T']
                ],
                columns: [
                    search.createColumn({ name: 'internalid', label: 'Internal ID' }),
                    search.createColumn({ name: 'tranid', label: 'Opportunity Number' }),
                    search.createColumn({ name: 'title', label: 'Title' }),
                    search.createColumn({ name: 'trandate', sort: search.Sort.DESC, label: 'Date' }),
                    search.createColumn({ name: 'entity', label: 'Customer' }),
                    search.createColumn({ name: 'status', label: 'Status' }),
                    search.createColumn({ name: 'probability', label: 'Probability' }),
                    search.createColumn({ name: 'projectedtotal', label: 'Projected Total' }),
                    search.createColumn({ name: 'expectedclosedate', label: 'Expected Close Date' }),
                    search.createColumn({ name: 'amount', label: 'Amount' }),
                    search.createColumn({ name: 'currency', label: 'Currency' }),
                    search.createColumn({ name: 'salesrep', label: 'Sales Rep' }),
                    search.createColumn({ name: 'leadsource', label: 'Lead Source' }),
                    search.createColumn({ name: 'partner', label: 'Partner' }),
                    search.createColumn({ name: 'department', label: 'Department' }),
                    search.createColumn({ name: 'class', label: 'Class' }),
                    search.createColumn({ name: 'location', label: 'Location' }),
                    search.createColumn({ name: 'subsidiary', label: 'Subsidiary' }),
                    search.createColumn({ name: 'memo', label: 'Memo' }),
                    search.createColumn({ name: 'datecreated', label: 'Date Created' }),
                    search.createColumn({ name: 'lastmodifieddate', label: 'Last Modified' })
                ]
            },

            // ============================================
            // SUPPORT CASE SEARCH
            // ============================================
            'case': {
                type: search.Type.SUPPORT_CASE,
                filters: [],
                columns: [
                    search.createColumn({ name: 'internalid', label: 'Internal ID' }),
                    search.createColumn({ name: 'casenumber', label: 'Case Number' }),
                    search.createColumn({ name: 'title', label: 'Subject' }),
                    search.createColumn({ name: 'company', label: 'Company' }),
                    search.createColumn({ name: 'contact', label: 'Contact' }),
                    search.createColumn({ name: 'email', label: 'Email' }),
                    search.createColumn({ name: 'phone', label: 'Phone' }),
                    search.createColumn({ name: 'status', label: 'Status' }),
                    search.createColumn({ name: 'priority', label: 'Priority' }),
                    search.createColumn({ name: 'origin', label: 'Origin' }),
                    search.createColumn({ name: 'category', label: 'Category' }),
                    search.createColumn({ name: 'assigned', label: 'Assigned To' }),
                    search.createColumn({ name: 'profile', label: 'Profile' }),
                    search.createColumn({ name: 'product', label: 'Product' }),
                    search.createColumn({ name: 'item', label: 'Item' }),
                    search.createColumn({ name: 'issue', label: 'Issue' }),
                    search.createColumn({ name: 'serialnumber', label: 'Serial Number' }),
                    search.createColumn({ name: 'startdate', label: 'Start Date' }),
                    search.createColumn({ name: 'enddate', label: 'End Date' }),
                    search.createColumn({ name: 'createddate', sort: search.Sort.DESC, label: 'Created Date' }),
                    search.createColumn({ name: 'lastmodifieddate', label: 'Last Modified' }),
                    search.createColumn({ name: 'subsidiary', label: 'Subsidiary' })
                ]
            },

            // ============================================
            // TASK SEARCH
            // ============================================
            'task': {
                type: search.Type.TASK,
                filters: [],
                columns: [
                    search.createColumn({ name: 'internalid', label: 'Internal ID' }),
                    search.createColumn({ name: 'title', label: 'Title' }),
                    search.createColumn({ name: 'status', label: 'Status' }),
                    search.createColumn({ name: 'priority', label: 'Priority' }),
                    search.createColumn({ name: 'startdate', label: 'Start Date' }),
                    search.createColumn({ name: 'duedate', label: 'Due Date' }),
                    search.createColumn({ name: 'completeddate', label: 'Completed Date' }),
                    search.createColumn({ name: 'percentcomplete', label: 'Percent Complete' }),
                    search.createColumn({ name: 'assigned', label: 'Assigned To' }),
                    search.createColumn({ name: 'owner', label: 'Owner' }),
                    search.createColumn({ name: 'company', label: 'Company' }),
                    search.createColumn({ name: 'contact', label: 'Contact' }),
                    search.createColumn({ name: 'transaction', label: 'Transaction' }),
                    search.createColumn({ name: 'case', label: 'Case' }),
                    search.createColumn({ name: 'message', label: 'Message' }),
                    search.createColumn({ name: 'createddate', sort: search.Sort.DESC, label: 'Created Date' }),
                    search.createColumn({ name: 'lastmodifieddate', label: 'Last Modified' })
                ]
            },

            // ============================================
            // CALENDAR EVENT SEARCH
            // ============================================
            'calendarevent': {
                type: search.Type.CALENDAR_EVENT,
                filters: [],
                columns: [
                    search.createColumn({ name: 'internalid', label: 'Internal ID' }),
                    search.createColumn({ name: 'title', label: 'Title' }),
                    search.createColumn({ name: 'status', label: 'Status' }),
                    search.createColumn({ name: 'startdate', label: 'Start Date' }),
                    search.createColumn({ name: 'starttime', label: 'Start Time' }),
                    search.createColumn({ name: 'enddate', label: 'End Date' }),
                    search.createColumn({ name: 'endtime', label: 'End Time' }),
                    search.createColumn({ name: 'alldayevent', label: 'All Day Event' }),
                    search.createColumn({ name: 'location', label: 'Location' }),
                    search.createColumn({ name: 'organizer', label: 'Organizer' }),
                    search.createColumn({ name: 'company', label: 'Company' }),
                    search.createColumn({ name: 'contact', label: 'Contact' }),
                    search.createColumn({ name: 'transaction', label: 'Transaction' }),
                    search.createColumn({ name: 'case', label: 'Case' }),
                    search.createColumn({ name: 'message', label: 'Message' }),
                    search.createColumn({ name: 'createddate', sort: search.Sort.DESC, label: 'Created Date' }),
                    search.createColumn({ name: 'lastmodifieddate', label: 'Last Modified' })
                ]
            },

            // ============================================
            // PHONE CALL SEARCH
            // ============================================
            'phonecall': {
                type: search.Type.PHONE_CALL,
                filters: [],
                columns: [
                    search.createColumn({ name: 'internalid', label: 'Internal ID' }),
                    search.createColumn({ name: 'title', label: 'Title' }),
                    search.createColumn({ name: 'status', label: 'Status' }),
                    search.createColumn({ name: 'startdate', label: 'Date' }),
                    search.createColumn({ name: 'starttime', label: 'Start Time' }),
                    search.createColumn({ name: 'endtime', label: 'End Time' }),
                    search.createColumn({ name: 'phone', label: 'Phone' }),
                    search.createColumn({ name: 'assigned', label: 'Assigned To' }),
                    search.createColumn({ name: 'owner', label: 'Owner' }),
                    search.createColumn({ name: 'company', label: 'Company' }),
                    search.createColumn({ name: 'contact', label: 'Contact' }),
                    search.createColumn({ name: 'transaction', label: 'Transaction' }),
                    search.createColumn({ name: 'case', label: 'Case' }),
                    search.createColumn({ name: 'message', label: 'Message' }),
                    search.createColumn({ name: 'completeddate', label: 'Completed Date' }),
                    search.createColumn({ name: 'createddate', sort: search.Sort.DESC, label: 'Created Date' }),
                    search.createColumn({ name: 'lastmodifieddate', label: 'Last Modified' })
                ]
            },

            // ============================================
            // LEAD SEARCH
            // ============================================
            'lead': {
                type: search.Type.LEAD,
                filters: [
                    ['isinactive', 'is', 'F']
                ],
                columns: [
                    search.createColumn({ name: 'internalid', label: 'Internal ID' }),
                    search.createColumn({ name: 'entityid', label: 'Lead ID' }),
                    search.createColumn({ name: 'companyname', label: 'Company Name' }),
                    search.createColumn({ name: 'firstname', label: 'First Name' }),
                    search.createColumn({ name: 'lastname', label: 'Last Name' }),
                    search.createColumn({ name: 'email', label: 'Email' }),
                    search.createColumn({ name: 'phone', label: 'Phone' }),
                    search.createColumn({ name: 'entitystatus', label: 'Status' }),
                    search.createColumn({ name: 'leadsource', label: 'Lead Source' }),
                    search.createColumn({ name: 'salesrep', label: 'Sales Rep' }),
                    search.createColumn({ name: 'partner', label: 'Partner' }),
                    search.createColumn({ name: 'territory', label: 'Territory' }),
                    search.createColumn({ name: 'category', label: 'Category' }),
                    search.createColumn({ name: 'address', label: 'Address' }),
                    search.createColumn({ name: 'city', label: 'City' }),
                    search.createColumn({ name: 'state', label: 'State' }),
                    search.createColumn({ name: 'zipcode', label: 'Zip Code' }),
                    search.createColumn({ name: 'country', label: 'Country' }),
                    search.createColumn({ name: 'subsidiary', label: 'Subsidiary' }),
                    search.createColumn({ name: 'datecreated', sort: search.Sort.DESC, label: 'Date Created' }),
                    search.createColumn({ name: 'lastmodifieddate', label: 'Last Modified' }),
                    search.createColumn({ name: 'isinactive', label: 'Inactive' })
                ]
            },

            // ============================================
            // PROSPECT SEARCH
            // ============================================
            'prospect': {
                type: search.Type.PROSPECT,
                filters: [
                    ['isinactive', 'is', 'F']
                ],
                columns: [
                    search.createColumn({ name: 'internalid', label: 'Internal ID' }),
                    search.createColumn({ name: 'entityid', label: 'Prospect ID' }),
                    search.createColumn({ name: 'companyname', label: 'Company Name' }),
                    search.createColumn({ name: 'firstname', label: 'First Name' }),
                    search.createColumn({ name: 'lastname', label: 'Last Name' }),
                    search.createColumn({ name: 'email', label: 'Email' }),
                    search.createColumn({ name: 'phone', label: 'Phone' }),
                    search.createColumn({ name: 'entitystatus', label: 'Status' }),
                    search.createColumn({ name: 'leadsource', label: 'Lead Source' }),
                    search.createColumn({ name: 'salesrep', label: 'Sales Rep' }),
                    search.createColumn({ name: 'partner', label: 'Partner' }),
                    search.createColumn({ name: 'territory', label: 'Territory' }),
                    search.createColumn({ name: 'category', label: 'Category' }),
                    search.createColumn({ name: 'address', label: 'Address' }),
                    search.createColumn({ name: 'city', label: 'City' }),
                    search.createColumn({ name: 'state', label: 'State' }),
                    search.createColumn({ name: 'zipcode', label: 'Zip Code' }),
                    search.createColumn({ name: 'country', label: 'Country' }),
                    search.createColumn({ name: 'subsidiary', label: 'Subsidiary' }),
                    search.createColumn({ name: 'datecreated', sort: search.Sort.DESC, label: 'Date Created' }),
                    search.createColumn({ name: 'lastmodifieddate', label: 'Last Modified' }),
                    search.createColumn({ name: 'isinactive', label: 'Inactive' })
                ]
            }
        };

        return configs[recordType] || null;
    }

    /**
     * Format a search result for display
     */
    function formatResult(result, recordType) {
        var formattedResult = {
            id: result.id,
            recordType: recordType,
            values: {}
        };

        result.columns.forEach(function(column) {
            var value = result.getValue(column);
            var text = result.getText(column);
            formattedResult.values[column.label || column.name] = text || value;
        });

        return formattedResult;
    }

    /**
     * Display search results in a Suitelet form
     */
    function displayResults(context, recordType, results) {
        var form = serverWidget.createForm({
            title: 'Search Results: ' + recordType.toUpperCase()
        });

        form.addButton({
            id: 'custpage_back',
            label: 'Back to Search',
            functionName: 'window.history.back()'
        });

        var sublist = form.addSublist({
            id: 'custpage_results',
            type: serverWidget.SublistType.LIST,
            label: 'Results (' + results.length + ' records found)'
        });

        // Add columns dynamically based on first result
        if (results.length > 0) {
            var columns = Object.keys(results[0].values);

            columns.forEach(function(colName) {
                sublist.addField({
                    id: 'custpage_' + colName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
                    type: serverWidget.FieldType.TEXT,
                    label: colName
                });
            });

            // Populate data
            results.forEach(function(result, index) {
                columns.forEach(function(colName) {
                    var fieldId = 'custpage_' + colName.toLowerCase().replace(/[^a-z0-9]/g, '_');
                    var value = result.values[colName] || '';
                    sublist.setSublistValue({
                        id: fieldId,
                        line: index,
                        value: String(value).substring(0, 300) // Truncate long values
                    });
                });
            });
        }

        context.response.writePage(form);
    }

    return {
        onRequest: onRequest
    };
});
