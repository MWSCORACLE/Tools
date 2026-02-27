/**
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 *
 * NetSuite Search Library Module
 * Reusable functions for creating and running saved searches
 * using the N/search module
 *
 * Usage: require this module in your scripts
 * define(['./SearchLibrary'], function(searchLib) { ... });
 */

define(['N/search', 'N/log'], function(search, log) {

    /**
     * Run a customer search with all available fields
     * @param {Object} options - Optional filters
     * @param {boolean} options.includeInactive - Include inactive customers
     * @param {string} options.subsidiary - Filter by subsidiary internal ID
     * @param {number} options.maxResults - Maximum results to return (default 1000)
     * @returns {Array} Array of customer records
     */
    function searchCustomers(options) {
        options = options || {};

        var filters = [];

        if (!options.includeInactive) {
            filters.push(['isinactive', 'is', 'F']);
        }

        if (options.subsidiary) {
            if (filters.length > 0) filters.push('AND');
            filters.push(['subsidiary', 'anyof', options.subsidiary]);
        }

        var columns = [
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
            search.createColumn({ name: 'isinactive', label: 'Inactive' })
        ];

        return runSearch(search.Type.CUSTOMER, filters, columns, options.maxResults);
    }

    /**
     * Run a sales order search with all available fields
     * @param {Object} options - Optional filters
     * @param {string} options.status - Filter by status
     * @param {string} options.dateFrom - Filter by date from (MM/DD/YYYY)
     * @param {string} options.dateTo - Filter by date to (MM/DD/YYYY)
     * @param {string} options.customer - Filter by customer internal ID
     * @param {number} options.maxResults - Maximum results to return
     * @returns {Array} Array of sales order records
     */
    function searchSalesOrders(options) {
        options = options || {};

        var filters = [
            ['mainline', 'is', 'T']
        ];

        if (options.status) {
            filters.push('AND');
            filters.push(['status', 'anyof', options.status]);
        }

        if (options.dateFrom) {
            filters.push('AND');
            filters.push(['trandate', 'onorafter', options.dateFrom]);
        }

        if (options.dateTo) {
            filters.push('AND');
            filters.push(['trandate', 'onorbefore', options.dateTo]);
        }

        if (options.customer) {
            filters.push('AND');
            filters.push(['entity', 'anyof', options.customer]);
        }

        var columns = [
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
            search.createColumn({ name: 'otherrefnum', label: 'PO/Check Number' })
        ];

        return runSearch(search.Type.SALES_ORDER, filters, columns, options.maxResults);
    }

    /**
     * Run an invoice search with all available fields
     * @param {Object} options - Optional filters
     * @param {string} options.status - Filter by status (e.g., 'CustInvc:A' for open)
     * @param {string} options.dateFrom - Filter by date from
     * @param {string} options.dateTo - Filter by date to
     * @param {string} options.customer - Filter by customer internal ID
     * @param {boolean} options.openOnly - Show only open invoices
     * @param {number} options.maxResults - Maximum results to return
     * @returns {Array} Array of invoice records
     */
    function searchInvoices(options) {
        options = options || {};

        var filters = [
            ['mainline', 'is', 'T']
        ];

        if (options.openOnly) {
            filters.push('AND');
            filters.push(['status', 'anyof', 'CustInvc:A']); // Open invoices
        } else if (options.status) {
            filters.push('AND');
            filters.push(['status', 'anyof', options.status]);
        }

        if (options.dateFrom) {
            filters.push('AND');
            filters.push(['trandate', 'onorafter', options.dateFrom]);
        }

        if (options.dateTo) {
            filters.push('AND');
            filters.push(['trandate', 'onorbefore', options.dateTo]);
        }

        if (options.customer) {
            filters.push('AND');
            filters.push(['entity', 'anyof', options.customer]);
        }

        var columns = [
            search.createColumn({ name: 'internalid', label: 'Internal ID' }),
            search.createColumn({ name: 'tranid', label: 'Invoice Number' }),
            search.createColumn({ name: 'trandate', sort: search.Sort.DESC, label: 'Date' }),
            search.createColumn({ name: 'entity', label: 'Customer' }),
            search.createColumn({ name: 'status', label: 'Status' }),
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
        ];

        return runSearch(search.Type.INVOICE, filters, columns, options.maxResults);
    }

    /**
     * Run an item search with all available fields
     * @param {Object} options - Optional filters
     * @param {string} options.type - Filter by item type
     * @param {boolean} options.includeInactive - Include inactive items
     * @param {number} options.maxResults - Maximum results to return
     * @returns {Array} Array of item records
     */
    function searchItems(options) {
        options = options || {};

        var filters = [];

        if (!options.includeInactive) {
            filters.push(['isinactive', 'is', 'F']);
        }

        if (options.type) {
            if (filters.length > 0) filters.push('AND');
            filters.push(['type', 'anyof', options.type]);
        }

        var columns = [
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
        ];

        return runSearch(search.Type.ITEM, filters, columns, options.maxResults);
    }

    /**
     * Run a transaction search across all transaction types
     * @param {Object} options - Optional filters
     * @param {string} options.type - Filter by transaction type
     * @param {string} options.dateFrom - Filter by date from
     * @param {string} options.dateTo - Filter by date to
     * @param {string} options.entity - Filter by entity internal ID
     * @param {number} options.maxResults - Maximum results to return
     * @returns {Array} Array of transaction records
     */
    function searchTransactions(options) {
        options = options || {};

        var filters = [
            ['mainline', 'is', 'T']
        ];

        if (options.type) {
            filters.push('AND');
            filters.push(['type', 'anyof', options.type]);
        }

        if (options.dateFrom) {
            filters.push('AND');
            filters.push(['trandate', 'onorafter', options.dateFrom]);
        }

        if (options.dateTo) {
            filters.push('AND');
            filters.push(['trandate', 'onorbefore', options.dateTo]);
        }

        if (options.entity) {
            filters.push('AND');
            filters.push(['entity', 'anyof', options.entity]);
        }

        var columns = [
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
        ];

        return runSearch(search.Type.TRANSACTION, filters, columns, options.maxResults);
    }

    /**
     * Run a vendor search with all available fields
     * @param {Object} options - Optional filters
     * @param {boolean} options.includeInactive - Include inactive vendors
     * @param {number} options.maxResults - Maximum results to return
     * @returns {Array} Array of vendor records
     */
    function searchVendors(options) {
        options = options || {};

        var filters = [];

        if (!options.includeInactive) {
            filters.push(['isinactive', 'is', 'F']);
        }

        var columns = [
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
        ];

        return runSearch(search.Type.VENDOR, filters, columns, options.maxResults);
    }

    /**
     * Run an employee search with all available fields
     * @param {Object} options - Optional filters
     * @param {boolean} options.includeInactive - Include inactive employees
     * @param {string} options.department - Filter by department
     * @param {string} options.supervisor - Filter by supervisor internal ID
     * @param {number} options.maxResults - Maximum results to return
     * @returns {Array} Array of employee records
     */
    function searchEmployees(options) {
        options = options || {};

        var filters = [];

        if (!options.includeInactive) {
            filters.push(['isinactive', 'is', 'F']);
        }

        if (options.department) {
            if (filters.length > 0) filters.push('AND');
            filters.push(['department', 'anyof', options.department]);
        }

        if (options.supervisor) {
            if (filters.length > 0) filters.push('AND');
            filters.push(['supervisor', 'anyof', options.supervisor]);
        }

        var columns = [
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
        ];

        return runSearch(search.Type.EMPLOYEE, filters, columns, options.maxResults);
    }

    /**
     * Generic search runner with pagination support
     * @param {string} recordType - NetSuite record type
     * @param {Array} filters - Search filters
     * @param {Array} columns - Search columns
     * @param {number} maxResults - Maximum results to return (default 1000)
     * @returns {Array} Array of formatted results
     */
    function runSearch(recordType, filters, columns, maxResults) {
        maxResults = maxResults || 1000;
        var results = [];

        try {
            var searchObj = search.create({
                type: recordType,
                filters: filters,
                columns: columns
            });

            var pagedData = searchObj.runPaged({ pageSize: 1000 });

            for (var i = 0; i < pagedData.pageRanges.length; i++) {
                var page = pagedData.fetch({ index: i });

                for (var j = 0; j < page.data.length; j++) {
                    if (results.length >= maxResults) {
                        return results;
                    }

                    var result = page.data[j];
                    var formattedResult = {
                        id: result.id,
                        recordType: recordType,
                        values: {}
                    };

                    columns.forEach(function(column) {
                        var fieldName = column.label || column.name;
                        var value = result.getValue(column);
                        var text = result.getText(column);
                        formattedResult.values[fieldName] = text || value;
                    });

                    results.push(formattedResult);
                }
            }

        } catch (e) {
            log.error({
                title: 'Search Error',
                details: 'Record Type: ' + recordType + ', Error: ' + e.message
            });
            throw e;
        }

        return results;
    }

    /**
     * Create and save a search to NetSuite
     * @param {Object} options - Search configuration
     * @param {string} options.type - Record type
     * @param {string} options.title - Search title
     * @param {string} options.id - Search script ID (optional)
     * @param {Array} options.filters - Search filters
     * @param {Array} options.columns - Search columns
     * @param {boolean} options.isPublic - Make search public
     * @returns {number} Internal ID of saved search
     */
    function createSavedSearch(options) {
        var searchObj = search.create({
            type: options.type,
            title: options.title,
            id: options.id,
            filters: options.filters,
            columns: options.columns,
            isPublic: options.isPublic || false
        });

        return searchObj.save();
    }

    /**
     * Load and run an existing saved search
     * @param {string|number} searchId - Saved search ID or internal ID
     * @param {number} maxResults - Maximum results to return
     * @returns {Array} Array of formatted results
     */
    function loadAndRunSearch(searchId, maxResults) {
        maxResults = maxResults || 1000;
        var results = [];

        try {
            var searchObj = search.load({ id: searchId });
            var columns = searchObj.columns;

            var pagedData = searchObj.runPaged({ pageSize: 1000 });

            for (var i = 0; i < pagedData.pageRanges.length; i++) {
                var page = pagedData.fetch({ index: i });

                for (var j = 0; j < page.data.length; j++) {
                    if (results.length >= maxResults) {
                        return results;
                    }

                    var result = page.data[j];
                    var formattedResult = {
                        id: result.id,
                        recordType: searchObj.searchType,
                        values: {}
                    };

                    columns.forEach(function(column) {
                        var fieldName = column.label || column.name;
                        var value = result.getValue(column);
                        var text = result.getText(column);
                        formattedResult.values[fieldName] = text || value;
                    });

                    results.push(formattedResult);
                }
            }

        } catch (e) {
            log.error({
                title: 'Load Search Error',
                details: 'Search ID: ' + searchId + ', Error: ' + e.message
            });
            throw e;
        }

        return results;
    }

    /**
     * Get available fields for a record type using Search.Type
     * @param {string} recordType - NetSuite record type
     * @returns {Object} Object containing search type info
     */
    function getRecordTypeInfo(recordType) {
        var typeMap = {
            'customer': { type: search.Type.CUSTOMER, description: 'Customer records' },
            'salesorder': { type: search.Type.SALES_ORDER, description: 'Sales Order transactions' },
            'invoice': { type: search.Type.INVOICE, description: 'Invoice transactions' },
            'purchaseorder': { type: search.Type.PURCHASE_ORDER, description: 'Purchase Order transactions' },
            'vendor': { type: search.Type.VENDOR, description: 'Vendor records' },
            'employee': { type: search.Type.EMPLOYEE, description: 'Employee records' },
            'item': { type: search.Type.ITEM, description: 'Item records' },
            'transaction': { type: search.Type.TRANSACTION, description: 'All transaction types' },
            'contact': { type: search.Type.CONTACT, description: 'Contact records' },
            'opportunity': { type: search.Type.OPPORTUNITY, description: 'Opportunity transactions' },
            'case': { type: search.Type.SUPPORT_CASE, description: 'Support Case records' },
            'task': { type: search.Type.TASK, description: 'Task records' },
            'calendarevent': { type: search.Type.CALENDAR_EVENT, description: 'Calendar Event records' },
            'phonecall': { type: search.Type.PHONE_CALL, description: 'Phone Call records' },
            'lead': { type: search.Type.LEAD, description: 'Lead records' },
            'prospect': { type: search.Type.PROSPECT, description: 'Prospect records' },
            'partner': { type: search.Type.PARTNER, description: 'Partner records' },
            'account': { type: search.Type.ACCOUNT, description: 'Account records' },
            'subsidiary': { type: search.Type.SUBSIDIARY, description: 'Subsidiary records' },
            'department': { type: search.Type.DEPARTMENT, description: 'Department records' },
            'location': { type: search.Type.LOCATION, description: 'Location records' },
            'class': { type: search.Type.CLASSIFICATION, description: 'Class records' },
            'campaign': { type: search.Type.CAMPAIGN, description: 'Campaign records' },
            'file': { type: search.Type.FILE, description: 'File Cabinet files' },
            'folder': { type: search.Type.FOLDER, description: 'File Cabinet folders' },
            'message': { type: search.Type.MESSAGE, description: 'Email messages' },
            'note': { type: search.Type.NOTE, description: 'Note records' }
        };

        return typeMap[recordType.toLowerCase()] || null;
    }

    // Public API
    return {
        // Specialized search functions
        searchCustomers: searchCustomers,
        searchSalesOrders: searchSalesOrders,
        searchInvoices: searchInvoices,
        searchItems: searchItems,
        searchTransactions: searchTransactions,
        searchVendors: searchVendors,
        searchEmployees: searchEmployees,

        // Generic functions
        runSearch: runSearch,
        createSavedSearch: createSavedSearch,
        loadAndRunSearch: loadAndRunSearch,
        getRecordTypeInfo: getRecordTypeInfo
    };
});
