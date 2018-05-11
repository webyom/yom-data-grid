(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("jquery"));
	else if(typeof define === 'function' && define.amd)
		define(["jquery"], factory);
	else if(typeof exports === 'object')
		exports["YomDataGrid"] = factory(require("jquery"));
	else
		root["YomDataGrid"] = factory(root["$"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_0__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 10);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_0__;

/***/ }),
/* 1 */
/***/ (function(module, exports) {

function $encodeHtml(str) {
    return (str + "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/`/g, "&#96;").replace(/'/g, "&#39;").replace(/"/g, "&quot;");
}

function render($data, $opt) {
    $data = $data || {};
    var _$out_ = "";
    var $print = function(str) {
        _$out_ += str;
    };
    var i18n = $data.i18n, column = $data.column, filterMap = $data.filterMap, normalizeFilterOptions = $opt.normalizeFilterOptions;
    var filterCriteria = filterMap[column.id] || {};
    var filterOption = column.filterOption || {};
    var type = filterOption.type;
    _$out_ += '<h3><i class="fa fa-filter"></i> ' + $encodeHtml(column.name || i18n.filter) + "</h3>";
    if (filterOption.remark) {
        _$out_ += '<p class="remark">' + filterOption.remark + "</p>";
    }
    _$out_ += '<div data-column-id="' + $encodeHtml(column.id) + '"><div class="alert alert-danger hidden"></div><div class="filter-option ' + (filterCriteria.findEmpty ? "hidden" : "") + '">';
    if (type == "set") {
        var options = normalizeFilterOptions(filterOption.options);
        var valueMap = filterCriteria.valueMap || {};
        if (filterOption.autoComplete) {
            _$out_ += '<div class="form-group"><input type="text" value="" class="form-control auto-complete-box" /></div>';
        } else {
            _$out_ += '<div class="set-container">';
            for (var i = 0, l = options.length; i < l; i++) {
                var option = options[i];
                var value = option.value, name = option.name;
                _$out_ += '<div class="checkbox"><label><input type="checkbox" value="' + $encodeHtml(value) + '" ' + (valueMap[value] ? "checked" : "") + " /> " + $encodeHtml(name) + "</label></div>";
            }
            _$out_ += "</div>";
        }
    } else if (type == "number") {
        _$out_ += '<div class="form-group"><label>' + i18n.compareValue + '</label><input name="value" type="text" maxlength="10" value="' + $encodeHtml(filterCriteria.value || filterCriteria.value === 0 ? filterCriteria.value : "") + '" class="form-control" /></div><div class="form-group"><label>' + i18n.compareMethod + '</label><select name="compareType" class="form-control"><option value="eq" ' + (filterCriteria.compareType == "eq" ? "selected" : "") + ">" + i18n.eq + '</option><option value="lt" ' + (filterCriteria.compareType == "lt" ? "selected" : "") + ">" + i18n.lt + '</option><option value="gt" ' + (filterCriteria.compareType == "gt" ? "selected" : "") + ">" + i18n.gt + "</option></select></div>";
    } else if (type == "date" || type == "datetime") {
        _$out_ += '<div class="form-group"><label>' + i18n.start + '</label><div class="datetimepicker-component input-group date date-from" data-date="' + $encodeHtml(filterCriteria.fromDisplay || "") + '" data-date-format="' + $encodeHtml(filterOption.format || (type == "datetime" ? "yyyy-mm-dd hh:ii" : "yyyy-mm-dd")) + '" data-value="' + $encodeHtml(filterCriteria.fromValue || "") + '"><input class="form-control" type="text" name="fromDate" value="' + $encodeHtml(filterCriteria.fromDisplay || "") + '" readonly /><div class="input-group-addon"><i class="fa fa-calendar" /></div></div></div><div class="form-group"><label>' + i18n.end + '</label><div class="datetimepicker-component input-group date date-to" data-date="' + $encodeHtml(filterCriteria.toDisplay || "") + '" data-date-format="' + $encodeHtml(filterOption.format || (type == "datetime" ? "yyyy-mm-dd hh:ii" : "yyyy-mm-dd")) + '" data-value="' + $encodeHtml(filterCriteria.toValue || "") + '"><input class="form-control" type="text" name="toDate" value="' + $encodeHtml(filterCriteria.toDisplay || "") + '" readonly /><div class="input-group-addon"><i class="fa fa-calendar" /></div></div></div>';
    } else {
        _$out_ += '<div class="form-group"><input name="value" type="text" value="' + $encodeHtml(filterCriteria.value || "") + '" class="form-control" /></div>';
    }
    _$out_ += "</div>";
    if (filterOption.enableEmpty) {
        _$out_ += '<div class="checkbox"><label><input name="findEmpty" type="checkbox" ' + (filterCriteria.findEmpty ? "checked" : "") + " /> " + i18n.empty + "</label></div>";
    }
    _$out_ += '<div class="row"><div class="col-xs-8"><button type="button" class="btn btn-primary btn-sm btn-confirm">' + i18n.ok + '</button><button type="button" class="btn btn-default btn-sm" data-toggle="yom-data-grid-filter-panel">' + i18n.cancel + '</button></div><div class="col-xs-4 text-right">';
    if (filterMap[column.id]) {
        _$out_ += '<a class="btn btn-remove" href="javascript:void(0);">' + i18n.clear + "</a>";
    }
    _$out_ += "</div></div></div>";
    return _$out_;
}

exports.render = render;

/***/ }),
/* 2 */
/***/ (function(module, exports) {

function $encodeHtml(str) {
    return (str + "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/`/g, "&#96;").replace(/'/g, "&#39;").replace(/"/g, "&quot;");
}

function render($data, $opt) {
    $data = $data || {};
    var _$out_ = "";
    var $print = function(str) {
        _$out_ += str;
    };
    var MAX_LOCKED_COLUMNS = $data.MAX_LOCKED_COLUMNS, i18n = $data.i18n, lockColumnAmount = $data.lockColumnAmount, hiddenColumns = $data.hiddenColumns, columns = $data.columns;
    _$out_ += '<h3><i class="fa fa-cog"></i> ' + i18n.setting + '</h3><div class="alert alert-danger hidden"></div><h4>' + i18n.displayAndSorting + '</h4><div class="yom-data-grid-setting-column-all"><label><input type="checkbox" /> ' + i18n.displayAll + '</label></div><div class="columns-container"><div class="yom-data-grid-setting-columns-container-inner">';
    for (var i = 0, l = columns.length; i < l; i++) {
        var column = columns[i];
        _$out_ += '<div class="yom-data-grid-setting-column-item"><input type="checkbox" value="' + $encodeHtml(column.id) + '" ' + (hiddenColumns.indexOf(column.id) >= 0 ? "" : "checked") + " /> " + $encodeHtml(column.name) + "</div>";
    }
    _$out_ += '</div><button class="btn btn-default btn-sm yom-data-grid-setting-btn-move-up disabled" disabled><i class="fa fa-long-arrow-up "></i></button><button class="btn btn-default btn-sm yom-data-grid-setting-btn-move-down disabled" disabled><i class="fa fa-long-arrow-down"></i></button></div><h4>' + i18n.locking + '</h4><div class="lock-options">';
    for (var i = 1; i <= MAX_LOCKED_COLUMNS; i++) {
        _$out_ += '<label class="radio-inline"><input type="radio" name="lock" value="' + i + '" ' + (lockColumnAmount == i ? "checked" : "") + " /> " + i + " " + i18n.column + "</label>";
    }
    _$out_ += '<label class="radio-inline"><input type="radio" name="lock" value="0" ' + (lockColumnAmount == 0 ? "checked" : "") + " /> " + i18n.noLocking + '</label></div><button type="button" class="btn btn-primary btn-sm yom-data-grid-btn-confirm-setting">' + i18n.ok + '</button><button type="button" class="btn btn-default btn-sm" data-toggle="yom-data-grid-setting-panel">' + i18n.cancel + "</button>";
    return _$out_;
}

exports.render = render;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global, module) {(function(global) {
    global.yomCssModuleHelper = global.yomCssModuleHelper || function(className, cssContent, moduleUri) {
        var head = document.head || document.getElementsByTagName("head")[0];
        var styleTagId = "yom-style-module-inject-tag";
        var styleTag = document.getElementById(styleTagId);
        if (!styleTag) {
            styleTag = document.createElement("style");
            styleTag.id = styleTagId;
            styleTag.type = "text/css";
            styleTag = head.appendChild(styleTag);
        }
        window._yom_style_module_injected = window._yom_style_module_injected || {};
        if (!moduleUri) {
            styleTag.appendChild(document.createTextNode(cssContent + "\n"));
        } else if (!window._yom_style_module_injected[moduleUri]) {
            styleTag.appendChild(document.createTextNode("/* " + moduleUri + " */\n" + cssContent + "\n"));
            window._yom_style_module_injected[moduleUri] = 1;
        }
        function formatClassName(cn) {
            return cn.replace(/^\s*&/, className).replace(/\s+&/g, " " + className).replace(/&/g, "");
        }
        function moduleClassNames() {
            var cns = [];
            var args = Array.prototype.slice.call(arguments);
            if (!args.length) {
                return className;
            }
            args.forEach(function(cn) {
                if (typeof cn == "object") {
                    Object.keys(cn).forEach(function(k) {
                        if (cn[k]) {
                            k = formatClassName(k);
                            k && cns.push(k);
                        }
                    });
                } else {
                    cn = formatClassName(cn);
                    cn && cns.push(cn);
                }
            });
            return cns.join(" ");
        }
        return {
            moduleClassNames: moduleClassNames,
            cssContent: cssContent
        };
    };
})(typeof global == "undefined" ? self : global);

var moduleUri = typeof module != "undefined" && module.uri;

var expo = yomCssModuleHelper("", '.yom-data-grid-filter-panel .btn-default,.yom-data-grid-filter-panel .btn-primary,.yom-data-grid-setting-panel .btn-default,.yom-data-grid-setting-panel .btn-primary{min-width:62px}.yom-data-grid-container{height:100%;position:relative}.yom-data-grid{border:1px solid #ccc;height:100%;-webkit-border-radius:2px;-moz-border-radius:2px;border-radius:2px}.yom-data-grid:after,.yom-data-grid:before{display:table;content:"";line-height:0}.yom-data-grid:after{clear:both}.yom-data-grid-locked table{table-layout:fixed}.yom-data-grid-locked table td,.yom-data-grid-locked table th{line-height:20px}.yom-data-grid-locked table td i[class^=icon]{font-size:17.5px}.yom-data-grid .yom-data-grid-body,.yom-data-grid .yom-data-grid-header{overflow:hidden}.yom-data-grid-table th{text-align:left}.yom-data-grid-table td{background-color:#fff}.yom-data-grid-cell-inner{line-height:15.4px;font-size:14px;padding:11px 9px}.yom-data-grid-cell-inner-dummy{height:1px}.yom-data-grid-bordered .yom-data-grid-cell-inner{border-bottom:solid 1px #ccc;border-right:solid 1px #ccc}.yom-data-grid-bordered .yom-data-grid-last-cell .yom-data-grid-cell-inner,.yom-data-grid-bordered-h .yom-data-grid-cell-inner{border-right:none}.yom-data-grid-bordered-v .yom-data-grid-cell-inner{border-bottom:none}.yom-data-grid-bordered th .yom-data-grid-cell-inner{border-bottom-width:2px}.yom-data-grid-bordered .yom-data-grid-last-row .yom-data-grid-cell-inner{border-bottom:none}[class*=yom-data-grid-header-rows-].yom-data-grid-bordered th .yom-data-grid-cell-inner{border-bottom-width:1px}.yom-data-grid-bordered .yom-data-grid-header .yom-data-grid-last-row .yom-data-grid-cell-inner{border-bottom:solid 2px #ccc}.yom-data-grid-locked .yom-data-grid-cell-inner{overflow:hidden;text-overflow:ellipsis;height:38.8px}.yom-data-grid-locked-columns{border-right:solid 2px #ccc}.yom-data-grid-striped .yom-data-grid-table .yom-data-grid-row-odd td{background-color:#f8f8f8}.yom-data-grid-sortable,.yom-data-grid-sortable:hover{color:#555;text-decoration:underline}.yom-data-grid-sort-arrow-down,.yom-data-grid-sort-arrow-up{display:inline-block;width:0;height:0;vertical-align:middle;border-right:4px solid transparent;border-left:4px solid transparent;content:"";margin-left:3px}.yom-data-grid-sort-arrow-down{border-top:4px solid #555}.yom-data-grid-sort-arrow-up{border-bottom:4px solid #555}.yom-data-grid-header-cell-inner{position:relative}.yom-data-grid-header-cell-inner .yom-data-grid-filter-icon{position:absolute;width:20px;height:20px;line-height:20px;text-align:center;top:50%;right:5px;margin-top:-10px;cursor:pointer;color:#555;-webkit-border-radius:2px;-moz-border-radius:2px;border-radius:2px}.yom-data-grid-header-cell-inner .yom-data-grid-filter-icon:hover{background-color:#eee}.yom-data-grid-header-cell-inner .yom-data-grid-filter-icon-left{left:9px;right:auto}.yom-data-grid-header-cell-inner:hover .yom-data-grid-filter-remove-icon .icon-remove{display:inline-block}.yom-data-grid-header-cell-inner:hover .yom-data-grid-filter-remove-icon .icon-filter{display:none}.yom-data-grid-header-cell-inner-filterable{padding-right:24px}.yom-data-grid-filter-panel{position:absolute;border:1px solid #ccc;background-color:#fff;width:252px;padding:10px;display:none;z-index:1;-webkit-border-radius:2px;-moz-border-radius:2px;border-radius:2px}.yom-data-grid-filter-panel h3{font-size:14px;margin:0 0 10px;color:#555}.yom-data-grid-filter-panel .remark{font-style:italic;color:#888}.yom-data-grid-filter-panel .alert-danger{padding:10px}.yom-data-grid-filter-panel .set-container{background-color:#f8f8f8;padding-left:10px;overflow-x:hidden;overflow-y:auto;max-height:145px;margin-bottom:10px;-webkit-border-radius:2px;-moz-border-radius:2px;border-radius:2px}.yom-data-grid-filter-panel .btn-confirm{margin-right:10px}.yom-data-grid-filter-remove-icon{color:#555}.yom-data-grid-filter-remove-icon .icon-remove{display:none}.yom-data-grid-filter-remove-icon:hover{color:#555}.yom-data-grid-setting-icon{position:absolute;width:20px;height:20px;line-height:20px;text-align:center;top:-20px;left:0;background-color:#eee;cursor:pointer;color:#555;z-index:1;display:none;-webkit-border-radius:2px;-moz-border-radius:2px;border-radius:2px}.yom-data-grid-container-sequence .yom-data-grid-setting-icon{top:9px;left:9px}.yom-data-grid-container:hover .yom-data-grid-setting-icon{display:block}.yom-data-grid-setting-panel{position:absolute;left:0;top:0;border:1px solid #ccc;background-color:#fff;width:300px;padding:10px;display:none;z-index:2;-webkit-border-radius:2px;-moz-border-radius:2px;border-radius:2px}.yom-data-grid-setting-panel h3,.yom-data-grid-setting-panel h4{font-size:14px;margin:0 0 10px;color:#555}.yom-data-grid-setting-panel h4{margin-top:10px}.yom-data-grid-setting-panel .alert-danger{padding:10px}.yom-data-grid-setting-panel .columns-container{position:relative;padding-right:40px}.yom-data-grid-setting-panel .yom-data-grid-setting-columns-container-inner{background-color:#f8f8f8;overflow-x:hidden;overflow-y:auto;max-height:255px;padding:5px 0;-webkit-border-radius:2px;-moz-border-radius:2px;border-radius:2px}.yom-data-grid-setting-panel .lock-options{margin-bottom:10px}.yom-data-grid-setting-panel .lock-options .radio-inline{margin-left:0;margin-right:10px}.yom-data-grid-setting-column-all{padding-left:10px}.yom-data-grid-setting-column-item{padding:3px 10px;position:relative;cursor:pointer}.yom-data-grid-setting-column-item.selected{background-color:#ddd}.yom-data-grid-setting-btn-move-down,.yom-data-grid-setting-btn-move-up{position:absolute;right:0;top:50%;margin-top:-40px;min-width:0!important}.yom-data-grid-setting-btn-move-down{position:absolute;right:0;top:50%;margin-top:10px}.yom-data-grid-btn-confirm-setting{margin-right:10px}.yom-data-grid .yom-data-grid-table .yom-data-grid-row-checked td{background-color:#ebf5ff}.yom-data-grid .yom-data-grid-table .yom-data-grid-row-error td{background-color:#f2dede}.yom-data-grid .yom-data-grid-table .yom-data-grid-row-hl td{background-color:#ffe}.yom-data-grid .yom-data-grid-table .yom-data-grid-row-checked.yom-data-grid-row-hl td{background-color:#d4e9ff}.yom-data-grid .yom-data-grid-table .yom-data-grid-row-error.yom-data-grid-row-hl td{background-color:#ebcccc}.yom-data-grid .yom-data-grid-table .yom-data-grid-sequence-cell{background-color:#fff!important;border-bottom:none;font-weight:700;color:#888}.yom-data-grid-sequence-cell .yom-data-grid-cell-inner{border-bottom:none;text-overflow:clip;padding-left:0;padding-right:0}.yom-data-grid-checkbox-cell .yom-data-grid-cell-inner{text-overflow:clip}.yom-data-grid-checkbox-cell input[type=checkbox]{margin:0}.yom-data-grid-row-clickable .yom-data-grid-content-cell{cursor:pointer}.yom-data-grid-container-height .yom-data-grid-columns,.yom-data-grid-container-height .yom-data-grid-locked-columns{position:absolute;top:0;left:0;right:0;bottom:0}.yom-data-grid-container-height .yom-data-grid-body{position:absolute;top:39px;left:0;right:0;bottom:0}.yom-data-grid-container-height .yom-data-grid-columns .yom-data-grid-body,.yom-data-grid-container-height .yom-data-grid-columns .yom-data-grid-header{overflow-y:scroll}.yom-data-grid-container-height .yom-data-grid-header-rows-1 .yom-data-grid-body{top:78px}.yom-data-grid-container-height .yom-data-grid-header-rows-2 .yom-data-grid-body{top:117px}.yom-data-grid-container-height .yom-data-grid-header-rows-3 .yom-data-grid-body{top:156px}.yom-data-grid-container-height .yom-data-grid-header-rows-4 .yom-data-grid-body{top:195px}', moduleUri);

module.exports = expo;
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(8), __webpack_require__(9)(module)))

/***/ }),
/* 4 */
/***/ (function(module, exports) {

function $encodeHtml(str) {
    return (str + "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/`/g, "&#96;").replace(/'/g, "&#39;").replace(/"/g, "&quot;");
}

function render($data, $opt) {
    $data = $data || {};
    var _$out_ = "";
    var $print = function(str) {
        _$out_ += str;
    };
    var DEFAULT_COLUMN_WIDTH = $data.DEFAULT_COLUMN_WIDTH, i18n = $data.i18n, name = $data.name, width = $data.width, noScrollX = $data.noScrollX, lockedColumns = $data.lockedColumns, scrollColumns = $data.scrollColumns, bordered = $data.bordered, striped = $data.striped, sortColumnId = $data.sortColumnId, sortOrder = $data.sortOrder, filterMap = $data.filterMap, checkbox = $data.checkbox, data = $data.data, headerData = $data.headerData, dataProperty = $data.dataProperty, isAllChecked = $data.isAllChecked, selectedIndex = $data.selectedIndex, maxSelection = $data.maxSelection, disableSetting = $data.disableSetting, opt = $data.opt;
    var i, l, column, columns, columnWidth, columnHeader, columnOffset, renderData, isHeaderData;
    var nextSeq = 1;
    var isPrevOdd = false;
    var scrollX = false;
    var lockedTableWidth = 0;
    var scrollTableWidth = 0;
    var lockedDisplayColumns = [];
    var lockedColumnWidth = "";
    var lockedColumnHeader = "";
    var scrollDisplayColumns = [];
    var scrollColumnWidth = "";
    var scrollColumnHeader = "";
    var noWidthScrollColumns = [];
    for (i = 0, l = lockedColumns.length; i < l; i++) {
        column = lockedColumns[i];
        if (column.hidden) {
            continue;
        }
        lockedDisplayColumns.push(column);
        lockedTableWidth += column.width;
        columnWidth = lockedColumnWidth;
        columnHeader = lockedColumnHeader;
        (function() {
            var name = $data.name;
            var filterable = column.filterable && opt.filterable !== false;
            columnWidth += '<colgroup><col style="width: ' + (column.locked ? column.width : noScrollX ? 0 : column.width) + 'px;"></colgroup>';
            columnHeader += '<th class="' + (column.type == "checkbox" ? "yom-data-grid-checkbox-cell" : "") + " " + (i == l - 1 ? "yom-data-grid-last-cell" : "") + " yom-data-grid-column-" + column.id.replace(/\./g, "-") + '"><div data-column-id="' + column.id + '" class="yom-data-grid-cell-inner yom-data-grid-header-cell-inner ' + (filterable ? "yom-data-grid-header-cell-inner-filterable" : "") + '" style="text-align: ' + (column.textAlign || "left") + ';">';
            if (column.type == "checkbox") {
                columnHeader += "";
                if (!(maxSelection > 0)) {
                    columnHeader += '<input class="yom-data-grid-check-box-all" type="checkbox" ' + (isAllChecked ? "checked" : "") + " />";
                } else {
                    columnHeader += "&nbsp;";
                }
            } else if (column.type == "sequence") {
                columnHeader += '<span title="' + $encodeHtml(column.name) + '">' + column.name + "</span>";
            } else {
                columnHeader += "";
                if (filterMap[column.id]) {
                    columnHeader += '<a class="yom-data-grid-filter-remove-icon" href="javascript:void(0);" title="' + i18n.clearFilterCriteria + '"><i class="fa fa-filter icon-filter"></i><i class="fa fa-remove icon-remove"></i></a>';
                }
                if (column.headerRenderer) {
                    columnHeader += "" + column.headerRenderer(column.name, i, column, sortColumnId, sortOrder) + "";
                } else if (column.sortable && opt.sortable !== false) {
                    columnHeader += '<a class="yom-data-grid-sortable" href="javascript:void(0);" onclick="return false" title="' + $encodeHtml(column.name) + '">' + column.name + "" + (sortColumnId == column.id ? sortOrder == "desc" ? '<span class="yom-data-grid-sort-arrow-down"></span>' : '<span class="yom-data-grid-sort-arrow-up"></span>' : "") + "</a>";
                } else {
                    columnHeader += '<span title="' + $encodeHtml(column.name) + '">' + column.name + "</span>";
                }
                if (filterable) {
                    columnHeader += '<a href="javascript:void(0);" class="yom-data-grid-filter-icon ' + (column.textAlign == "right" ? "yom-data-grid-filter-icon-left" : "") + '"><i class="fa fa-filter"></i></a>';
                }
            }
            columnHeader += "</div></th>";
        })();
        lockedColumnWidth = columnWidth;
        lockedColumnHeader = columnHeader;
    }
    for (i = 0, l = scrollColumns.length; i < l; i++) {
        column = scrollColumns[i];
        if (column.hidden) {
            continue;
        }
        scrollDisplayColumns.push(column);
        if (!column.width) {
            noWidthScrollColumns.push(column);
        } else {
            scrollTableWidth += column.width;
        }
        columnWidth = scrollColumnWidth;
        columnHeader = scrollColumnHeader;
        (function() {
            var name = $data.name;
            var filterable = column.filterable && opt.filterable !== false;
            columnWidth += '<colgroup><col style="width: ' + (column.locked ? column.width : noScrollX ? 0 : column.width) + 'px;"></colgroup>';
            columnHeader += '<th class="' + (column.type == "checkbox" ? "yom-data-grid-checkbox-cell" : "") + " " + (i == l - 1 ? "yom-data-grid-last-cell" : "") + " yom-data-grid-column-" + column.id.replace(/\./g, "-") + '"><div data-column-id="' + column.id + '" class="yom-data-grid-cell-inner yom-data-grid-header-cell-inner ' + (filterable ? "yom-data-grid-header-cell-inner-filterable" : "") + '" style="text-align: ' + (column.textAlign || "left") + ';">';
            if (column.type == "checkbox") {
                columnHeader += "";
                if (!(maxSelection > 0)) {
                    columnHeader += '<input class="yom-data-grid-check-box-all" type="checkbox" ' + (isAllChecked ? "checked" : "") + " />";
                } else {
                    columnHeader += "&nbsp;";
                }
            } else if (column.type == "sequence") {
                columnHeader += '<span title="' + $encodeHtml(column.name) + '">' + column.name + "</span>";
            } else {
                columnHeader += "";
                if (filterMap[column.id]) {
                    columnHeader += '<a class="yom-data-grid-filter-remove-icon" href="javascript:void(0);" title="' + i18n.clearFilterCriteria + '"><i class="fa fa-filter icon-filter"></i><i class="fa fa-remove icon-remove"></i></a>';
                }
                if (column.headerRenderer) {
                    columnHeader += "" + column.headerRenderer(column.name, i, column, sortColumnId, sortOrder) + "";
                } else if (column.sortable && opt.sortable !== false) {
                    columnHeader += '<a class="yom-data-grid-sortable" href="javascript:void(0);" onclick="return false" title="' + $encodeHtml(column.name) + '">' + column.name + "" + (sortColumnId == column.id ? sortOrder == "desc" ? '<span class="yom-data-grid-sort-arrow-down"></span>' : '<span class="yom-data-grid-sort-arrow-up"></span>' : "") + "</a>";
                } else {
                    columnHeader += '<span title="' + $encodeHtml(column.name) + '">' + column.name + "</span>";
                }
                if (filterable) {
                    columnHeader += '<a href="javascript:void(0);" class="yom-data-grid-filter-icon ' + (column.textAlign == "right" ? "yom-data-grid-filter-icon-left" : "") + '"><i class="fa fa-filter"></i></a>';
                }
            }
            columnHeader += "</div></th>";
        })();
        scrollColumnWidth = columnWidth;
        scrollColumnHeader = columnHeader;
    }
    if (!noScrollX && width > 0) {
        if (noWidthScrollColumns.length) {
            if (width - lockedTableWidth - scrollTableWidth < noWidthScrollColumns.length * DEFAULT_COLUMN_WIDTH) {
                for (i = 0, l = noWidthScrollColumns.length; i < l; i++) {
                    noWidthScrollColumns[i].width = DEFAULT_COLUMN_WIDTH;
                }
                scrollTableWidth += noWidthScrollColumns.length * DEFAULT_COLUMN_WIDTH;
                scrollColumnWidth = "";
                for (i = 0, l = scrollDisplayColumns.length; i < l; i++) {
                    column = scrollDisplayColumns[i];
                    scrollColumnWidth += '<colgroup><col style="width: ' + (column.width || DEFAULT_COLUMN_WIDTH) + 'px;"></colgroup>';
                }
                scrollX = true;
            } else {
                width = "auto";
            }
        } else {
            if (lockedTableWidth + scrollTableWidth > width) {
                scrollX = true;
            } else {
                width = "auto";
            }
        }
    }
    if (!disableSetting) {
        _$out_ += '<a class="yom-data-grid-setting-icon" href="javascript:void(0);"><i class="fa fa-cog"></i></a>';
    }
    _$out_ += '<div class="yom-data-grid-setting-panel"></div><div class="yom-data-grid ' + (lockedDisplayColumns.length ? "yom-data-grid-locked" : "") + " " + (bordered ? "yom-data-grid-bordered" : "") + " " + (bordered == "h" || bordered == "v" ? "yom-data-grid-bordered-" + bordered : "") + " " + (striped ? "yom-data-grid-striped" : "") + " " + (headerData.length > 0 ? "yom-data-grid-header-rows-" + headerData.length : "") + '" style="overflow: hidden;"><table border="0" cellspacing="0" cellpadding="0" style="width: 100%; height: 100%;"><tr>';
    if (lockedDisplayColumns.length) {
        _$out_ += '<td class="yom-data-grid-columns-container" style="width: ' + lockedTableWidth + 'px;"><div class="yom-data-grid-locked-columns" style="width: ' + lockedTableWidth + 'px; overflow: hidden;"><div class="yom-data-grid-header"><table class="yom-data-grid-table" border="0" cellspacing="0" cellpadding="0" style="width: ' + lockedTableWidth + 'px;">' + lockedColumnWidth + "<tbody><tr>" + lockedColumnHeader + "</tr>";
        if (headerData.length) {
            columnOffset = 0;
            columns = lockedDisplayColumns;
            renderData = headerData;
            isHeaderData = true;
            (function() {
                var opt = $data.opt;
                var i, l, j, l2, seq, isOdd, item, columnValue, displayValue, title, ids, checkable, rowClickable, cellClickable;
                if (renderData.length) {
                    for (i = 0, l = renderData.length; i < l; i++) {
                        item = dataProperty ? renderData[i][dataProperty] : renderData[i];
                        if (isHeaderData) {
                            isOdd = i % 2 === 0;
                        } else if (opt.isOddRow) {
                            isOdd = opt.isOddRow(item, isPrevOdd);
                        } else {
                            isOdd = (i + headerData.length) % 2 === 0;
                        }
                        isPrevOdd = isOdd;
                        rowClickable = opt.getRowClickable ? opt.getRowClickable(i, item, isHeaderData) : !isHeaderData;
                        _$out_ += "<tr data-grid-" + (isHeaderData ? "header-row" : "row") + '="' + i + '" class="' + (i == l - 1 ? "yom-data-grid-last-row" : "") + " " + (isOdd ? "yom-data-grid-row-odd" : "") + " " + (rowClickable && (opt.onRowClick || opt.onRowDblclick) ? "yom-data-grid-row-clickable" : "") + " " + (opt.getRowClassName ? opt.getRowClassName(i, item, isHeaderData) : "") + " " + (selectedIndex.length && selectedIndex.indexOf(i) >= 0 ? "yom-data-grid-row-checked" : "") + '">';
                        for (j = 0, l2 = columns.length; j < l2; j++) {
                            column = columns[j];
                            ids = column.id.split(".");
                            columnValue = item[ids.shift()];
                            while (ids.length && columnValue && typeof columnValue == "object") {
                                columnValue = columnValue[ids.shift()];
                            }
                            if (columnValue != null && columnValue.toString) {
                                columnValue = columnValue.toString();
                            }
                            cellClickable = opt.getCellClickable ? opt.getCellClickable(i, item, column.id, column, isHeaderData) : !isHeaderData;
                            if (column.renderer) {
                                displayValue = column.renderer($encodeHtml(columnValue || ""), i, item, j + columnOffset, column, isHeaderData);
                                if (displayValue == null) {
                                    displayValue = "";
                                } else if (cellClickable && (column.clickable || column.onClick || column.onDblclick)) {
                                    displayValue = '<a class="yom-data-grid-cell-clickable" href="javascript:void(0);">' + displayValue + "</a>";
                                }
                            } else {
                                if (columnValue && cellClickable && (column.clickable || column.onClick || column.onDblclick)) {
                                    displayValue = '<a class="yom-data-grid-cell-clickable" href="javascript:void(0);">' + $encodeHtml(columnValue || "") + "</a>";
                                } else {
                                    displayValue = $encodeHtml(columnValue || "");
                                }
                            }
                            if (column.titleRenderer) {
                                title = column.titleRenderer(columnValue, i, item, j + columnOffset, column, isHeaderData);
                            } else if (typeof column.title != "undefined") {
                                if (column.title == "__content__") {
                                    title = displayValue;
                                } else {
                                    title = column.title;
                                }
                            } else if (column.renderer) {
                                if (cellClickable && (column.clickable || column.onClick || column.onDblclick)) {
                                    title = column.renderer($encodeHtml(columnValue || ""), i, item, j + columnOffset, column, isHeaderData);
                                    if (title == null) {
                                        title = "";
                                    }
                                } else {
                                    title = displayValue;
                                }
                            } else {
                                title = columnValue || "";
                            }
                            _$out_ += '<td data-grid-column-id="' + column.id + '" id="yom-data-grid-' + name + "-" + (isHeaderData ? "header-cell" : "cell") + "-" + i + "-" + (j + columnOffset) + '" class="' + (column.type == "sequence" ? "yom-data-grid-sequence-cell" : column.type == "checkbox" ? "yom-data-grid-checkbox-cell" : "yom-data-grid-content-cell") + " " + (j == l2 - 1 ? "yom-data-grid-last-cell" : "") + " yom-data-grid-column-" + column.id.replace(/\./g, "-") + '"><div class="yom-data-grid-cell-inner" title="' + $encodeHtml(title) + '" style="text-align: ' + (column.textAlign || "left") + ';">';
                            if (column.type == "sequence") {
                                if (isHeaderData) {
                                    seq = 0;
                                } else if (opt.getSequence) {
                                    seq = opt.getSequence(item, nextSeq);
                                    nextSeq = seq > 0 ? seq + 1 : nextSeq;
                                } else {
                                    seq = i + 1;
                                }
                                _$out_ += "" + (seq > 0 ? seq : "&nbsp;") + "";
                            } else if (column.type == "checkbox") {
                                checkable = !checkbox || !checkbox.checkable || checkbox.checkable(item, i);
                                if (isHeaderData) {
                                    _$out_ += "&nbsp;";
                                } else if (checkable) {
                                    _$out_ += '<input class="yom-data-grid-check-box" data-row-index="' + i + '" type="checkbox" ' + (selectedIndex.length && selectedIndex.indexOf(i) >= 0 ? "checked" : "") + " />";
                                } else {
                                    _$out_ += '<input class="yom-data-grid-check-box" data-row-index="' + i + '" type="checkbox" disabled />';
                                }
                            } else {
                                _$out_ += "" + (displayValue || "&nbsp;") + "";
                            }
                            _$out_ += "</div></td>";
                        }
                        _$out_ += "</tr>";
                    }
                } else if (!isHeaderData) {
                    _$out_ += "\x3c!-- use a dummy row to enable horizental scroll --\x3e<tr>";
                    for (j = 0, l2 = columns.length; j < l2; j++) {
                        _$out_ += '<td><div class="yom-data-grid-cell-inner-dummy"></div></td>';
                    }
                    _$out_ += "</tr>";
                }
            })();
        }
        _$out_ += '</tbody></table></div><div class="yom-data-grid-body" style="' + (scrollX ? "overflow-x: scroll;" : "") + " width: " + lockedTableWidth + 'px;"><table class="yom-data-grid-table" border="0" cellspacing="0" cellpadding="0" style="width: ' + lockedTableWidth + 'px;">' + lockedColumnWidth + "<tbody>";
        columnOffset = 0;
        columns = lockedDisplayColumns;
        renderData = data;
        isHeaderData = false;
        (function() {
            var opt = $data.opt;
            var i, l, j, l2, seq, isOdd, item, columnValue, displayValue, title, ids, checkable, rowClickable, cellClickable;
            if (renderData.length) {
                for (i = 0, l = renderData.length; i < l; i++) {
                    item = dataProperty ? renderData[i][dataProperty] : renderData[i];
                    if (isHeaderData) {
                        isOdd = i % 2 === 0;
                    } else if (opt.isOddRow) {
                        isOdd = opt.isOddRow(item, isPrevOdd);
                    } else {
                        isOdd = (i + headerData.length) % 2 === 0;
                    }
                    isPrevOdd = isOdd;
                    rowClickable = opt.getRowClickable ? opt.getRowClickable(i, item, isHeaderData) : !isHeaderData;
                    _$out_ += "<tr data-grid-" + (isHeaderData ? "header-row" : "row") + '="' + i + '" class="' + (i == l - 1 ? "yom-data-grid-last-row" : "") + " " + (isOdd ? "yom-data-grid-row-odd" : "") + " " + (rowClickable && (opt.onRowClick || opt.onRowDblclick) ? "yom-data-grid-row-clickable" : "") + " " + (opt.getRowClassName ? opt.getRowClassName(i, item, isHeaderData) : "") + " " + (selectedIndex.length && selectedIndex.indexOf(i) >= 0 ? "yom-data-grid-row-checked" : "") + '">';
                    for (j = 0, l2 = columns.length; j < l2; j++) {
                        column = columns[j];
                        ids = column.id.split(".");
                        columnValue = item[ids.shift()];
                        while (ids.length && columnValue && typeof columnValue == "object") {
                            columnValue = columnValue[ids.shift()];
                        }
                        if (columnValue != null && columnValue.toString) {
                            columnValue = columnValue.toString();
                        }
                        cellClickable = opt.getCellClickable ? opt.getCellClickable(i, item, column.id, column, isHeaderData) : !isHeaderData;
                        if (column.renderer) {
                            displayValue = column.renderer($encodeHtml(columnValue || ""), i, item, j + columnOffset, column, isHeaderData);
                            if (displayValue == null) {
                                displayValue = "";
                            } else if (cellClickable && (column.clickable || column.onClick || column.onDblclick)) {
                                displayValue = '<a class="yom-data-grid-cell-clickable" href="javascript:void(0);">' + displayValue + "</a>";
                            }
                        } else {
                            if (columnValue && cellClickable && (column.clickable || column.onClick || column.onDblclick)) {
                                displayValue = '<a class="yom-data-grid-cell-clickable" href="javascript:void(0);">' + $encodeHtml(columnValue || "") + "</a>";
                            } else {
                                displayValue = $encodeHtml(columnValue || "");
                            }
                        }
                        if (column.titleRenderer) {
                            title = column.titleRenderer(columnValue, i, item, j + columnOffset, column, isHeaderData);
                        } else if (typeof column.title != "undefined") {
                            if (column.title == "__content__") {
                                title = displayValue;
                            } else {
                                title = column.title;
                            }
                        } else if (column.renderer) {
                            if (cellClickable && (column.clickable || column.onClick || column.onDblclick)) {
                                title = column.renderer($encodeHtml(columnValue || ""), i, item, j + columnOffset, column, isHeaderData);
                                if (title == null) {
                                    title = "";
                                }
                            } else {
                                title = displayValue;
                            }
                        } else {
                            title = columnValue || "";
                        }
                        _$out_ += '<td data-grid-column-id="' + column.id + '" id="yom-data-grid-' + name + "-" + (isHeaderData ? "header-cell" : "cell") + "-" + i + "-" + (j + columnOffset) + '" class="' + (column.type == "sequence" ? "yom-data-grid-sequence-cell" : column.type == "checkbox" ? "yom-data-grid-checkbox-cell" : "yom-data-grid-content-cell") + " " + (j == l2 - 1 ? "yom-data-grid-last-cell" : "") + " yom-data-grid-column-" + column.id.replace(/\./g, "-") + '"><div class="yom-data-grid-cell-inner" title="' + $encodeHtml(title) + '" style="text-align: ' + (column.textAlign || "left") + ';">';
                        if (column.type == "sequence") {
                            if (isHeaderData) {
                                seq = 0;
                            } else if (opt.getSequence) {
                                seq = opt.getSequence(item, nextSeq);
                                nextSeq = seq > 0 ? seq + 1 : nextSeq;
                            } else {
                                seq = i + 1;
                            }
                            _$out_ += "" + (seq > 0 ? seq : "&nbsp;") + "";
                        } else if (column.type == "checkbox") {
                            checkable = !checkbox || !checkbox.checkable || checkbox.checkable(item, i);
                            if (isHeaderData) {
                                _$out_ += "&nbsp;";
                            } else if (checkable) {
                                _$out_ += '<input class="yom-data-grid-check-box" data-row-index="' + i + '" type="checkbox" ' + (selectedIndex.length && selectedIndex.indexOf(i) >= 0 ? "checked" : "") + " />";
                            } else {
                                _$out_ += '<input class="yom-data-grid-check-box" data-row-index="' + i + '" type="checkbox" disabled />';
                            }
                        } else {
                            _$out_ += "" + (displayValue || "&nbsp;") + "";
                        }
                        _$out_ += "</div></td>";
                    }
                    _$out_ += "</tr>";
                }
            } else if (!isHeaderData) {
                _$out_ += "\x3c!-- use a dummy row to enable horizental scroll --\x3e<tr>";
                for (j = 0, l2 = columns.length; j < l2; j++) {
                    _$out_ += '<td><div class="yom-data-grid-cell-inner-dummy"></div></td>';
                }
                _$out_ += "</tr>";
            }
        })();
        _$out_ += "</tbody></table></div></div></td>";
    }
    if (scrollDisplayColumns.length) {
        _$out_ += '<td class="yom-data-grid-columns-container"><div class="yom-data-grid-columns" style="left: ' + lockedTableWidth + 'px;"><div class="yom-data-grid-header" style="width: 100%;"><table class="yom-data-grid-table" border="0" cellspacing="0" cellpadding="0" style="width: ' + (width > lockedTableWidth ? width - lockedTableWidth + "px" : "100%") + ';">' + scrollColumnWidth + "<tbody><tr>" + scrollColumnHeader + "</tr>";
        if (headerData.length) {
            columnOffset = lockedDisplayColumns.length;
            columns = scrollDisplayColumns;
            renderData = headerData;
            isHeaderData = true;
            (function() {
                var opt = $data.opt;
                var i, l, j, l2, seq, isOdd, item, columnValue, displayValue, title, ids, checkable, rowClickable, cellClickable;
                if (renderData.length) {
                    for (i = 0, l = renderData.length; i < l; i++) {
                        item = dataProperty ? renderData[i][dataProperty] : renderData[i];
                        if (isHeaderData) {
                            isOdd = i % 2 === 0;
                        } else if (opt.isOddRow) {
                            isOdd = opt.isOddRow(item, isPrevOdd);
                        } else {
                            isOdd = (i + headerData.length) % 2 === 0;
                        }
                        isPrevOdd = isOdd;
                        rowClickable = opt.getRowClickable ? opt.getRowClickable(i, item, isHeaderData) : !isHeaderData;
                        _$out_ += "<tr data-grid-" + (isHeaderData ? "header-row" : "row") + '="' + i + '" class="' + (i == l - 1 ? "yom-data-grid-last-row" : "") + " " + (isOdd ? "yom-data-grid-row-odd" : "") + " " + (rowClickable && (opt.onRowClick || opt.onRowDblclick) ? "yom-data-grid-row-clickable" : "") + " " + (opt.getRowClassName ? opt.getRowClassName(i, item, isHeaderData) : "") + " " + (selectedIndex.length && selectedIndex.indexOf(i) >= 0 ? "yom-data-grid-row-checked" : "") + '">';
                        for (j = 0, l2 = columns.length; j < l2; j++) {
                            column = columns[j];
                            ids = column.id.split(".");
                            columnValue = item[ids.shift()];
                            while (ids.length && columnValue && typeof columnValue == "object") {
                                columnValue = columnValue[ids.shift()];
                            }
                            if (columnValue != null && columnValue.toString) {
                                columnValue = columnValue.toString();
                            }
                            cellClickable = opt.getCellClickable ? opt.getCellClickable(i, item, column.id, column, isHeaderData) : !isHeaderData;
                            if (column.renderer) {
                                displayValue = column.renderer($encodeHtml(columnValue || ""), i, item, j + columnOffset, column, isHeaderData);
                                if (displayValue == null) {
                                    displayValue = "";
                                } else if (cellClickable && (column.clickable || column.onClick || column.onDblclick)) {
                                    displayValue = '<a class="yom-data-grid-cell-clickable" href="javascript:void(0);">' + displayValue + "</a>";
                                }
                            } else {
                                if (columnValue && cellClickable && (column.clickable || column.onClick || column.onDblclick)) {
                                    displayValue = '<a class="yom-data-grid-cell-clickable" href="javascript:void(0);">' + $encodeHtml(columnValue || "") + "</a>";
                                } else {
                                    displayValue = $encodeHtml(columnValue || "");
                                }
                            }
                            if (column.titleRenderer) {
                                title = column.titleRenderer(columnValue, i, item, j + columnOffset, column, isHeaderData);
                            } else if (typeof column.title != "undefined") {
                                if (column.title == "__content__") {
                                    title = displayValue;
                                } else {
                                    title = column.title;
                                }
                            } else if (column.renderer) {
                                if (cellClickable && (column.clickable || column.onClick || column.onDblclick)) {
                                    title = column.renderer($encodeHtml(columnValue || ""), i, item, j + columnOffset, column, isHeaderData);
                                    if (title == null) {
                                        title = "";
                                    }
                                } else {
                                    title = displayValue;
                                }
                            } else {
                                title = columnValue || "";
                            }
                            _$out_ += '<td data-grid-column-id="' + column.id + '" id="yom-data-grid-' + name + "-" + (isHeaderData ? "header-cell" : "cell") + "-" + i + "-" + (j + columnOffset) + '" class="' + (column.type == "sequence" ? "yom-data-grid-sequence-cell" : column.type == "checkbox" ? "yom-data-grid-checkbox-cell" : "yom-data-grid-content-cell") + " " + (j == l2 - 1 ? "yom-data-grid-last-cell" : "") + " yom-data-grid-column-" + column.id.replace(/\./g, "-") + '"><div class="yom-data-grid-cell-inner" title="' + $encodeHtml(title) + '" style="text-align: ' + (column.textAlign || "left") + ';">';
                            if (column.type == "sequence") {
                                if (isHeaderData) {
                                    seq = 0;
                                } else if (opt.getSequence) {
                                    seq = opt.getSequence(item, nextSeq);
                                    nextSeq = seq > 0 ? seq + 1 : nextSeq;
                                } else {
                                    seq = i + 1;
                                }
                                _$out_ += "" + (seq > 0 ? seq : "&nbsp;") + "";
                            } else if (column.type == "checkbox") {
                                checkable = !checkbox || !checkbox.checkable || checkbox.checkable(item, i);
                                if (isHeaderData) {
                                    _$out_ += "&nbsp;";
                                } else if (checkable) {
                                    _$out_ += '<input class="yom-data-grid-check-box" data-row-index="' + i + '" type="checkbox" ' + (selectedIndex.length && selectedIndex.indexOf(i) >= 0 ? "checked" : "") + " />";
                                } else {
                                    _$out_ += '<input class="yom-data-grid-check-box" data-row-index="' + i + '" type="checkbox" disabled />';
                                }
                            } else {
                                _$out_ += "" + (displayValue || "&nbsp;") + "";
                            }
                            _$out_ += "</div></td>";
                        }
                        _$out_ += "</tr>";
                    }
                } else if (!isHeaderData) {
                    _$out_ += "\x3c!-- use a dummy row to enable horizental scroll --\x3e<tr>";
                    for (j = 0, l2 = columns.length; j < l2; j++) {
                        _$out_ += '<td><div class="yom-data-grid-cell-inner-dummy"></div></td>';
                    }
                    _$out_ += "</tr>";
                }
            })();
        }
        _$out_ += '</tbody></table></div><div class="yom-data-grid-body" style="' + (scrollX ? "overflow-x: scroll;" : "") + ' width: 100%;"><table class="yom-data-grid-table" border="0" cellspacing="0" cellpadding="0" style="width: ' + (width > lockedTableWidth ? width - lockedTableWidth + "px" : "100%") + ';">' + scrollColumnWidth + "<tbody>";
        columnOffset = lockedDisplayColumns.length;
        columns = scrollDisplayColumns;
        renderData = data;
        isHeaderData = false;
        (function() {
            var opt = $data.opt;
            var i, l, j, l2, seq, isOdd, item, columnValue, displayValue, title, ids, checkable, rowClickable, cellClickable;
            if (renderData.length) {
                for (i = 0, l = renderData.length; i < l; i++) {
                    item = dataProperty ? renderData[i][dataProperty] : renderData[i];
                    if (isHeaderData) {
                        isOdd = i % 2 === 0;
                    } else if (opt.isOddRow) {
                        isOdd = opt.isOddRow(item, isPrevOdd);
                    } else {
                        isOdd = (i + headerData.length) % 2 === 0;
                    }
                    isPrevOdd = isOdd;
                    rowClickable = opt.getRowClickable ? opt.getRowClickable(i, item, isHeaderData) : !isHeaderData;
                    _$out_ += "<tr data-grid-" + (isHeaderData ? "header-row" : "row") + '="' + i + '" class="' + (i == l - 1 ? "yom-data-grid-last-row" : "") + " " + (isOdd ? "yom-data-grid-row-odd" : "") + " " + (rowClickable && (opt.onRowClick || opt.onRowDblclick) ? "yom-data-grid-row-clickable" : "") + " " + (opt.getRowClassName ? opt.getRowClassName(i, item, isHeaderData) : "") + " " + (selectedIndex.length && selectedIndex.indexOf(i) >= 0 ? "yom-data-grid-row-checked" : "") + '">';
                    for (j = 0, l2 = columns.length; j < l2; j++) {
                        column = columns[j];
                        ids = column.id.split(".");
                        columnValue = item[ids.shift()];
                        while (ids.length && columnValue && typeof columnValue == "object") {
                            columnValue = columnValue[ids.shift()];
                        }
                        if (columnValue != null && columnValue.toString) {
                            columnValue = columnValue.toString();
                        }
                        cellClickable = opt.getCellClickable ? opt.getCellClickable(i, item, column.id, column, isHeaderData) : !isHeaderData;
                        if (column.renderer) {
                            displayValue = column.renderer($encodeHtml(columnValue || ""), i, item, j + columnOffset, column, isHeaderData);
                            if (displayValue == null) {
                                displayValue = "";
                            } else if (cellClickable && (column.clickable || column.onClick || column.onDblclick)) {
                                displayValue = '<a class="yom-data-grid-cell-clickable" href="javascript:void(0);">' + displayValue + "</a>";
                            }
                        } else {
                            if (columnValue && cellClickable && (column.clickable || column.onClick || column.onDblclick)) {
                                displayValue = '<a class="yom-data-grid-cell-clickable" href="javascript:void(0);">' + $encodeHtml(columnValue || "") + "</a>";
                            } else {
                                displayValue = $encodeHtml(columnValue || "");
                            }
                        }
                        if (column.titleRenderer) {
                            title = column.titleRenderer(columnValue, i, item, j + columnOffset, column, isHeaderData);
                        } else if (typeof column.title != "undefined") {
                            if (column.title == "__content__") {
                                title = displayValue;
                            } else {
                                title = column.title;
                            }
                        } else if (column.renderer) {
                            if (cellClickable && (column.clickable || column.onClick || column.onDblclick)) {
                                title = column.renderer($encodeHtml(columnValue || ""), i, item, j + columnOffset, column, isHeaderData);
                                if (title == null) {
                                    title = "";
                                }
                            } else {
                                title = displayValue;
                            }
                        } else {
                            title = columnValue || "";
                        }
                        _$out_ += '<td data-grid-column-id="' + column.id + '" id="yom-data-grid-' + name + "-" + (isHeaderData ? "header-cell" : "cell") + "-" + i + "-" + (j + columnOffset) + '" class="' + (column.type == "sequence" ? "yom-data-grid-sequence-cell" : column.type == "checkbox" ? "yom-data-grid-checkbox-cell" : "yom-data-grid-content-cell") + " " + (j == l2 - 1 ? "yom-data-grid-last-cell" : "") + " yom-data-grid-column-" + column.id.replace(/\./g, "-") + '"><div class="yom-data-grid-cell-inner" title="' + $encodeHtml(title) + '" style="text-align: ' + (column.textAlign || "left") + ';">';
                        if (column.type == "sequence") {
                            if (isHeaderData) {
                                seq = 0;
                            } else if (opt.getSequence) {
                                seq = opt.getSequence(item, nextSeq);
                                nextSeq = seq > 0 ? seq + 1 : nextSeq;
                            } else {
                                seq = i + 1;
                            }
                            _$out_ += "" + (seq > 0 ? seq : "&nbsp;") + "";
                        } else if (column.type == "checkbox") {
                            checkable = !checkbox || !checkbox.checkable || checkbox.checkable(item, i);
                            if (isHeaderData) {
                                _$out_ += "&nbsp;";
                            } else if (checkable) {
                                _$out_ += '<input class="yom-data-grid-check-box" data-row-index="' + i + '" type="checkbox" ' + (selectedIndex.length && selectedIndex.indexOf(i) >= 0 ? "checked" : "") + " />";
                            } else {
                                _$out_ += '<input class="yom-data-grid-check-box" data-row-index="' + i + '" type="checkbox" disabled />';
                            }
                        } else {
                            _$out_ += "" + (displayValue || "&nbsp;") + "";
                        }
                        _$out_ += "</div></td>";
                    }
                    _$out_ += "</tr>";
                }
            } else if (!isHeaderData) {
                _$out_ += "\x3c!-- use a dummy row to enable horizental scroll --\x3e<tr>";
                for (j = 0, l2 = columns.length; j < l2; j++) {
                    _$out_ += '<td><div class="yom-data-grid-cell-inner-dummy"></div></td>';
                }
                _$out_ += "</tr>";
            }
        })();
        _$out_ += "</tbody></table></div></div></td>";
    }
    _$out_ += "</tr></table></div>";
    return _$out_;
}

exports.render = render;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

var $ = __webpack_require__(0);

function encodeHtml(str) {
	return (str + "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/`/g, "&#96;").replace(/'/g, "&#39;").replace(/"/g, "&quot;");
}

function encodeCsvCellValue(value) {
	if((/,|"/).test(value)) {
		value = '"' + value.replace(/"/g, '""') + '"';
	}
	return value;
}

function getCellValue(data, column, i, j) {
	var ids = column.id.split('.');
	var value = data[ids.shift()];
	while(ids.length && value && typeof value == 'object') {
		value = value[ids.shift()];
	}
	if(value != null && value.toString) {
		value = value.toString();
	}
	var renderer = column.exportRenderer || column.renderer;
	if(renderer) {
		value = renderer(encodeHtml(value || ''), i, data, j, column, false);
		if(value == null) {
			value = '';
		}
	}
	return value;
}

function exportCsv(data, columns, fileName) {
	fileName = (fileName || new Date().getTime()) + '.csv';
	var blobData = [];
	var i;
	for(i = -1; i < data.length; i++) {
		var rowData = [];
		columns.forEach(function(column, j) {
			if(i === -1) {
				rowData.push(encodeCsvCellValue(column.name));
			} else {
				rowData.push(encodeCsvCellValue(getCellValue(data[i], column, i, j)));
			}
		});
		blobData.push(rowData.join(','));
	}
	var blob = new Blob(['\ufeff' + blobData.join('\n')], {type: 'text/csv'});
	if(window.navigator.msSaveOrOpenBlob) {
		navigator.msSaveBlob(blob, fileName);
	} else {
		var link = document.createElement('a');
		link.href = window.URL.createObjectURL(blob);
		link.download = fileName;
		link.click();
		window.URL.revokeObjectURL(link.href);
	}
}

function exportXlsx(data, columns, fileName) {
	fileName = (fileName || new Date().getTime()) + '.xlsx';
	window.require(['xlsx'], function (XLSX) {
		var blobData = [];
		var i;
		for(i = -1; i < data.length; i++) {
			var rowData = [];
			columns.forEach(function(column, j) {
				if(i === -1) {
					rowData.push(column.name);
				} else {
					rowData.push(getCellValue(data[i], column, i, j));
				}
			});
			blobData.push(rowData);
		}
		var wb = XLSX.utils.book_new();
		var ws = XLSX.utils.aoa_to_sheet(blobData);
		XLSX.utils.book_append_sheet(wb, ws, fileName);
		XLSX.writeFile(wb, fileName);
	});
}

module.exports = {
	exportCsv: exportCsv,
	exportXlsx: exportXlsx
};


/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = {
	'en': {
		ok: 'Ok',
		cancel: 'Cancel',

		displayAll: 'Display All',
		filter: 'Filter',
		clear: 'Clear',
		eq: 'Equal',
		lt: 'Less Than',
		gt: 'Greater Than',
		compareMethod: 'Compare Method',
		compareValue: 'Compare Value',
		start: 'Start',
		end: 'End',
		empty: 'Empty',
		clearFilterCriteria: 'Clear filter criteria',
		atLeastOneColumn: 'Need to display at least one column',
		filterCriteriaRequired: 'Please input filter criteria',
		filterValueContainIllegalChar: 'Can not input “;”',
		compareValueRequired: 'Please input compare value',
		atLeastOneDateRequired: 'Please at least choose one date',
		startDateCanNotLaterThanEndDate: 'Start date can not be later than end date',
		noResultMsg: 'No result',

		setting: 'Setting',
		displayAndSorting: 'Display and Sorting',
		locking: 'Locking',
		noLocking: 'No Locking',
		column: 'column'
	},

	'zh-CN': {
		ok: '确定',
		cancel: '取消',

		displayAll: '全部显示',
		filter: '筛选',
		clear: '清除',
		eq: '等于',
		lt: '小于',
		gt: '大于',
		compareMethod: '比较方式',
		compareValue: '比较值',
		start: '开始',
		end: '结束',
		empty: '空（未填写）',
		clearFilterCriteria: '清除过滤条件',
		atLeastOneColumn: '至少显示一列',
		filterCriteriaRequired: '请输入筛选条件',
		filterValueContainIllegalChar: '不能输入“;”',
		compareValueRequired: '请输入比较值',
		atLeastOneDateRequired: '请至少指定一个日期',
		startDateCanNotLaterThanEndDate: '开始日期不能晚于结束日期',
		noResultMsg: '找不到结果',

		setting: '设置',
		displayAndSorting: '显示和排序',
		locking: '锁定',
		noLocking: '不锁定',
		column: '列'
	}
};


/***/ }),
/* 7 */
/***/ (function(module, exports) {

/**
 * https://github.com/mout/mout
 */

/**
 * Merge sort (http://en.wikipedia.org/wiki/Merge_sort)
 */
function mergeSort(arr, compareFn) {
	if (arr == null) {
		return [];
	} else if (arr.length < 2) {
		return arr;
	}

	if (compareFn == null) {
		compareFn = defaultCompare;
	}

	var mid, left, right;

	mid = ~~(arr.length / 2);
	left = mergeSort( arr.slice(0, mid), compareFn );
	right = mergeSort( arr.slice(mid, arr.length), compareFn );

	return merge(left, right, compareFn);
}

function defaultCompare(a, b) {
	return a < b ? -1 : (a > b? 1 : 0);
}

function merge(left, right, compareFn) {
	var result = [];

	while (left.length && right.length) {
		if (compareFn(left[0], right[0]) <= 0) {
			// if 0 it should preserve same order (stable)
			result.push(left.shift());
		} else {
			result.push(right.shift());
		}
	}

	if (left.length) {
		result.push.apply(result, left);
	}

	if (right.length) {
		result.push.apply(result, right);
	}

	return result;
}

module.exports = mergeSort;


/***/ }),
/* 8 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 9 */
/***/ (function(module, exports) {

module.exports = function(module) {
	if(!module.webpackPolyfill) {
		module.deprecate = function() {};
		module.paths = [];
		// module.parent = undefined by default
		if(!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function() {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function() {
				return module.i;
			}
		});
		module.webpackPolyfill = 1;
	}
	return module;
};


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

var $ = __webpack_require__(0);
var mainTpl = __webpack_require__(4);
var filterPanelTpl = __webpack_require__(1);
var settingPanelTpl = __webpack_require__(2);
var i18n = __webpack_require__(6);
var mergeSort = __webpack_require__(7);
var exportMod = __webpack_require__(5);
__webpack_require__(3);

var YomDataGrid = function(holder, columns, opt) {
	var self = this;
	opt = opt || {};
	this._opt = opt;
	this._name = opt.name || 'x';
	this._i18n = i18n[opt.language] || i18n['en'];
	this._width = opt.width;
	this._holder = $(holder);
	this._container = $('<div class="yom-data-grid-container' + (opt.height == '100%' ? ' yom-data-grid-container-height' : '') + (opt.sequence ? ' yom-data-grid-container-sequence' : '') + '"></div>').appendTo(holder);
	this._filterPanel = $('<div class="yom-data-grid-filter-panel"></div>').appendTo(document.body);
	this._settingPanel = null;
	this._allColumns = [];
	this._defaultLockedColumns = [];
	this._lockedColumns = [];
	this._scrollColumns = [];
	this._data = [];
	this._headerData = [];
	this._lockedBody = null;
	this._scrollHeader = null;
	this._scrollBody = null;
	this._scrollLeft = opt.scrollLeft || 0;
	this._scrollTop = opt.scrollTop || 0;

	// sortting
	this._sortColumnId = '';
	this._sortOrder = '';

	// filter
	this._filterMap = {};
	this._activeFilterColumn = null;

	// column sortting & lock & hidden
	this._lockColumnAmount = 0;
	this._columnSequence = [];
	this._hiddenColumns = [];

	this._rowClickToRef = null;

	this._bind = {
		scroll: function(evt) {
			self._onScroll(evt);
		},
		scrollLocked: function(evt) {
			self._onScrollLocked(evt);
		},
		autoResize: function(evt) {
			var selectedIndex = self.getSelectedIndex();
			if(self._opt.maxSelection > 0) {
				selectedIndex = selectedIndex.slice(0, self._opt.maxSelection);
			}
			self.render(null, null, null, null, {
				isAllChecked: self.isAllChecked(),
				selectedIndex: selectedIndex
			});
		},
		documentClick: function(evt) {
			self._hideFilterPanel(evt);
			self._hideSettingPanel(evt);
		}
	};

	this.setColumns(columns, this.getSetting());
	this._bindEvent();
};

YomDataGrid.getVisibleColumns = function(columns, setting) {
	columns = columns || [];
	setting = setting || {};
	if(Array.isArray(setting.columnSequence)) {
		columns = mergeSort(columns, function(a, b) {
			var as = setting.columnSequence.indexOf(a.id);
			var bs = setting.columnSequence.indexOf(b.id);
			as = as >= 0 ? as : 9999;
			bs = bs >= 0 ? bs : 9999;
			return as - bs;
		});
	}
	if(Array.isArray(setting.hiddenColumns)) {
		columns = columns.filter(function(c) {
			if(setting.hiddenColumns.indexOf(c.id) >= 0) {
				return false;
			} else {
				return true;
			}
		});
	}
	return columns;
};

$.extend(YomDataGrid.prototype, {
	_MAX_LOCKED_COLUMNS: 3,
	_MIN_COLUMN_WIDTH: 38,
	_MAX_COLUMN_WIDTH: 999,
	_MAX_LOCKED_COLUMN_WIDTH: 300,
	_DEFAULT_COLUMN_WIDTH: 200,

	_onScroll: function(evt) {
		var target = evt.target;
		if(this._lockedBody) {
			this._scrollTop = this._lockedBody.scrollTop = target.scrollTop;
		}
		if(this._scrollHeader) {
			this._scrollLeft = this._scrollHeader.scrollLeft = target.scrollLeft;
		}
		this._hideFilterPanel();
		this._hideSettingPanel();
	},

	_onScrollLocked: function(evt) {
		var e = evt.originalEvent;
		var step = -30;
		var x = 0;
		var y = 0;
		var top, left;
		var lockedBody = this._lockedBody;
		var scrollBody = this._scrollBody[0];
		if(!scrollBody) {
			return;
		}
		if(!isNaN(e.wheelDeltaX)) {
			x = e.wheelDeltaX / 120;
		} else if(!isNaN(e.deltaX)) {
			x = e.deltaX / 120 * -3;
		}
		if(!isNaN(e.wheelDeltaY)) {
			y = e.wheelDeltaY / 120;
		} else if(!isNaN(e.deltaY)) {
			y = e.deltaY / 120 * -3;
		} else if(!isNaN(e.wheelDelta)) {
			y = e.wheelDelta / 120;
		}
		x = x * step;
		y = y * step;
		if(x > 0 && x < 1) {
			x = 1;
		} else if(x < 0 && x > -1) {
			x = -1;
		}
		if(y > 0 && y < 1) {
			y = 1;
		} else if(y < 0 && y > -1) {
			y = -1;
		}
		if($.contains(scrollBody, evt.target) && (scrollBody.scrollLeft > 0 && scrollBody.scrollLeft + $(scrollBody).width() < scrollBody.scrollWidth || scrollBody.scrollLeft === 0 && x > 0 || scrollBody.scrollLeft + $(scrollBody).width() == scrollBody.scrollWidth && x < 0)) {
			return;
		}
		if(Math.abs(x) > Math.abs(y)) { // scroll x
			left = scrollBody.scrollLeft + x;
			scrollBody.scrollLeft = left;
			if(this._scrollHeader) {
				this._scrollHeader.scrollLeft = left;
			}
			this._scrollLeft = left;
			(scrollBody.scrollWidth == scrollBody.clientWidth) || evt.preventDefault();
		} else if(Math.abs(y) > 0) { // scroll y
			top = scrollBody.scrollTop + y;
			if(lockedBody) {
				lockedBody.scrollTop = top;
			}
			scrollBody.scrollTop = top;
			this._scrollTop = top;
			(scrollBody.scrollHeight == scrollBody.clientHeight) || evt.preventDefault();
		}
	},

	_clientSort: function() {
		var sortOrder = this._sortOrder;
		var columnId = this._sortColumnId;
		var dataProperty = this._opt.dataProperty;
		this._data = mergeSort(this._data, function(a, b) {
			if(dataProperty) {
				a = a[dataProperty];
				b = b[dataProperty];
			}
			if(sortOrder == 'asc') {
				return a[columnId] > b[columnId] ? 1 : -1;
			} else {
				return b[columnId] > a[columnId] ? 1 : -1;
			}
		});
		this.render(this._data);
	},

	_updateSettingColumnCheckboxAll: function () {
		var checkedCount = 0;
		var uncheckedCount = 0;
		var checkboxAll = $('.yom-data-grid-setting-column-all input')[0];
		$('.yom-data-grid-setting-column-item input', this._container).each(function (i, item) {
			if (item.checked) {
				checkedCount++;
			} else {
				uncheckedCount++;
			}
		});
		if (checkedCount && uncheckedCount) {
			checkboxAll.checked = true;
			checkboxAll.indeterminate = true;
		} else if (checkedCount) {
			checkboxAll.indeterminate = false;
			checkboxAll.checked = true;
		} else {
			checkboxAll.indeterminate = false;
			checkboxAll.checked = false;
		}
	},

	_hideSettingPanel: function(evt) {
		if(evt) {
			var target = $(evt.target);
			if(target.hasClass('yom-data-grid-setting-icon') || target.closest('.yom-data-grid-setting-icon').length) {
				return;
			}
			if((target.hasClass('yom-data-grid-setting-panel') || target.closest('.yom-data-grid-setting-panel').length) && target.attr('data-toggle') != 'yom-data-grid-setting-panel') {
				return;
			}
		}
		this._settingPanel && this._settingPanel.hide();
	},

	_showSettingErrMsg: function(msg) {
		$('.alert-danger', this._settingPanel).html(msg).removeClass('hidden');
	},

	_submitSettingForm: function() {
		var hiddenColumns = $('.columns-container input:not(:checked)', this._settingPanel).map(function(i, item) {
			return item.value;
		}).get();
		if(hiddenColumns.length == this._allColumns.length) {
			this._showSettingErrMsg(this._i18n.atLeastOneColumn);
			return;
		}
		var columnSequence = $('.columns-container input', this._settingPanel).map(function(i, item) {
			return item.value;
		}).get();
		var lockColumnAmount = parseInt($('[name="lock"]:checked', this._settingPanel).val()) || 0;
		this._lockColumnAmount = lockColumnAmount;
		this._columnSequence = columnSequence;
		this._hiddenColumns = hiddenColumns;
		this._hideSettingPanel();
		if(this._opt.onSettingChange) {
			this._opt.onSettingChange(this.getSetting());
		}
	},

	_hideFilterPanel: function(evt) {
		if(!this._filterPanel || this._filterPanel.is(':hidden')) {
			return;
		}
		if(evt) {
			var target = $(evt.target);
			if(target.hasClass('yom-data-grid-filter-icon') || target.closest('.yom-data-grid-filter-icon').length) {
				return;
			}
			if((target.hasClass('yom-data-grid-filter-panel') || target.closest('.yom-data-grid-filter-panel').length) && target.attr('data-toggle') != 'yom-data-grid-filter-panel') {
				return;
			}
		}

		var dateFromDom = $('.date-from', this._filterPanel);
		var dateToDom = $('.date-to', this._filterPanel);
		dateFromDom.length && dateFromDom.datetimepicker('remove');
		dateToDom.length && dateToDom.datetimepicker('remove');

		var box = $('.auto-complete-box', this._filterPanel);
		if(box.length) {
			var autoComplete = box.data('autoComplete');
			autoComplete && autoComplete.destroy();
			box.data('autoComplete', null);
		}

		this._filterPanel.hide();
		this._activeFilterColumn = null;
	},

	_showFilterErrMsg: function(msg) {
		$('.alert-danger', this._filterPanel).html(msg).removeClass('hidden');
	},

	_submitFilterForm: function() {
		var self = this;
		var findEmpty = !!$('[name="findEmpty"]', this._filterPanel).prop('checked');
		var column = this._activeFilterColumn;
		var filterOption = column.filterOption || {};
		var filterCriteria = {};
		var value, valueEl;
		if(!findEmpty) {
			if(filterOption.type == 'set') {
				value = [];
				var valueMap = {};
				if(filterOption.autoComplete) {
					var box = $('.auto-complete-box', this._filterPanel);
					var autoComplete = box.data('autoComplete');
					value = autoComplete.getSelectedPropList('id');
					if(!value.length) {
						this._showFilterErrMsg(this._i18n.filterCriteriaRequired);
						return;
					}
					value.forEach(function(id) {
						valueMap[id] = self._opt.getOptionNameById && self._opt.getOptionNameById(id) || 1;
					});
				} else {
					var set = $('.filter-option input', this._filterPanel).filter(function(i, item) {
						return item.checked;
					}).map(function(i, item) {
						if(!valueMap[item.value]) {
							value.push(item.value);
						}
						valueMap[item.value] = 1;
						return item.value;
					}).get();
					if(!set.length) {
						this._showFilterErrMsg(this._i18n.filterCriteriaRequired);
						return;
					}
				}
				filterCriteria.valueMap = valueMap;
				filterCriteria.value = value;
			} else if(filterOption.type == 'number') {
				var compareType = $('[name="compareType"]', this._filterPanel).val();
				valueEl = $('[name="value"]', this._filterPanel);
				if((/;/).test(valueEl.val())) {
					this._showFilterErrMsg(this._i18n.filterValueContainIllegalChar);
					return;
				}
				value = parseFloat($.trim(valueEl.val()));
				if(isNaN(value)) {
					this._showFilterErrMsg(this._i18n.compareValueRequired);
					return;
				}
				filterCriteria.compareType = compareType;
				filterCriteria.value = value;
			} else if(filterOption.type == 'date' || filterOption.type == 'datetime') {
				var dateFromDom = $('.date-from', this._filterPanel);
				var dateToDom = $('.date-to', this._filterPanel);
				if(dateFromDom.attr('data-value')) {
					filterCriteria.fromValue = parseInt(dateFromDom.attr('data-value'));
					filterCriteria.fromDisplay = dateFromDom.find('input').val();
				}
				if(dateToDom.attr('data-value')) {
					filterCriteria.toValue = parseInt(dateToDom.attr('data-value'));
					filterCriteria.toDisplay = dateToDom.find('input').val();
				}
				if(!filterCriteria.fromValue && !filterCriteria.toValue) {
					this._showFilterErrMsg(this._i18n.atLeastOneDateRequired);
					return;
				}
				if(filterCriteria.fromValue > filterCriteria.toValue) {
					this._showFilterErrMsg(this._i18n.startDateCanNotLaterThanEndDate);
					return;
				}
			} else {
				valueEl = $('[name="value"]', this._filterPanel);
				if((/;/).test(valueEl.val())) {
					this._showFilterErrMsg(this._i18n.filterValueContainIllegalChar);
					return;
				}
				value = $.trim(valueEl.val().replace(/\s*,\s*/g, ','));
				if(!value) {
					this._showFilterErrMsg(this._i18n.filterCriteriaRequired);
					return;
				}
				filterCriteria.value = value;
			}
		}
		filterCriteria.type = filterOption.type;
		filterCriteria.findEmpty = findEmpty;
		this._filterMap[column.id] = filterCriteria;
		this._hideFilterPanel();
		if(this._opt.onStateChange) {
			this._opt.onStateChange(this.getState());
		}
	},

	_removeFilter: function(columnId) {
		this._hideFilterPanel();
		delete this._filterMap[columnId];
		if(this._opt.onStateChange) {
			this._opt.onStateChange(this.getState());
		}
	},

	_setFilterMap: function(filterMap) {
		filterMap = this.parseFilterMap(filterMap);
		if(filterMap) {
			this._filterMap = {};
			for(var p in filterMap) {
				if(filterMap.hasOwnProperty(p)) {
					this._filterMap[p] = filterMap[p];
				}
			}
		}
	},

	_updateColumnSortBtnStatus: function() {
		var selectedEl = $('.yom-data-grid-setting-column-item.selected', self._container);
		var hasPrev = selectedEl.prev().length;
		var hasNext = selectedEl.next().length;
		if(hasPrev) {
			$('.yom-data-grid-setting-btn-move-up', this._container).removeClass('disabled').prop('disabled', false);
		} else {
			$('.yom-data-grid-setting-btn-move-up', this._container).addClass('disabled').prop('disabled', true);
		}
		if(hasNext) {
			$('.yom-data-grid-setting-btn-move-down', this._container).removeClass('disabled').prop('disabled', false);
		} else {
			$('.yom-data-grid-setting-btn-move-down', this._container).addClass('disabled').prop('disabled', true);
		}
	},

	_updateColumnSortScroll: function() {
		var selectedEl = $('.yom-data-grid-setting-column-item.selected', self._container);
		var container = $('.yom-data-grid-setting-columns-container-inner', self._container);
		var top = selectedEl.offset().top - container.offset().top;
		var containerHeight = container.innerHeight();
		var selectedHeight = selectedEl.outerHeight();
		if(top > containerHeight - selectedHeight * 2) {
			container.prop('scrollTop', container.prop('scrollTop') + top + selectedHeight * 2 - containerHeight);
		}
		if(top < selectedHeight) {
			container.prop('scrollTop', container.prop('scrollTop') + Math.abs(top) - selectedHeight);
		}
	},

	_bindEvent: function() {
		var self = this;
		this._container.delegate('.yom-data-grid-sortable', 'click', function(evt) {
			var columnId = $(this).closest('[data-column-id]').attr('data-column-id');
			var sortOrder = $('.yom-data-grid-sort-arrow-down', this).length ? 'asc' : 'desc';
			self._sortOrder = sortOrder;
			self._sortColumnId = columnId;
			if(self._opt.clientSort) {
				self._clientSort();
			} else if(self._opt.onStateChange) {
				self._opt.onStateChange(self.getState());
			}
		}).delegate('.yom-data-grid-setting-icon', 'click', function(evt) {
			self.showSettingPanel();
		}).delegate('.yom-data-grid-btn-confirm-setting', 'click', function(evt) {
			self._submitSettingForm();
		}).delegate('.yom-data-grid-setting-column-item', 'click', function(evt) {
			$('.yom-data-grid-setting-column-item', self._container).removeClass('selected');
			$(this).addClass('selected');
			self._updateColumnSortBtnStatus();
		}).delegate('.yom-data-grid-setting-column-item input', 'click', function(evt) {
			self._updateSettingColumnCheckboxAll();
		}).delegate('.yom-data-grid-setting-column-all input', 'click', function(evt) {
			var checked = evt.currentTarget.checked;
			$('.yom-data-grid-setting-column-item input', self._container).each(function (i, item) {
				item.checked = checked;
			});
		}).delegate('.yom-data-grid-setting-btn-move-up', 'click', function(evt) {
			var selectedEl = $('.yom-data-grid-setting-column-item.selected', self._container);
			if(selectedEl.length) {
				selectedEl.insertBefore(selectedEl.prev());
				self._updateColumnSortBtnStatus();
				self._updateColumnSortScroll();
			}
		}).delegate('.yom-data-grid-setting-btn-move-down', 'click', function(evt) {
			var selectedEl = $('.yom-data-grid-setting-column-item.selected', self._container);
			if(selectedEl.length) {
				selectedEl.insertAfter(selectedEl.next());
				self._updateColumnSortBtnStatus();
				self._updateColumnSortScroll();
			}
		}).delegate('.yom-data-grid-filter-icon', 'click', function(evt) {
			var cell = $(this).closest('[data-column-id]');
			var columnId = cell.attr('data-column-id');
			var column = self.getColumnById(columnId);
			if(column) {
				self.showFilterPanel(column, $(this), 'right');
			}
		}).delegate('.yom-data-grid-filter-remove-icon', 'click', function(evt) {
			var cell = $(this).closest('[data-column-id]');
			var columnId = cell.attr('data-column-id');
			self._removeFilter(columnId);
		}).delegate('.yom-data-grid-check-box, .yom-data-grid-check-box-all', 'click', function(evt) {
			var rowIndex = $(this).attr('data-row-index');
			var allChecked = true;
			var checked = this.checked;
			if(!(rowIndex >= 0)) { // all
				self.setAllSelection(checked);
				self._setCheckboxAllStatus(checked);
				allChecked = checked;
			} else {
				if(checked) {
					if(self._opt.maxSelection > 0 && self.getSelectedIndex().length > self._opt.maxSelection) {
						this.checked = false;
						self._opt.onExceedMaxSelection && self._opt.onExceedMaxSelection(self._opt.maxSelection);
						return;
					}
					allChecked = self.isAllChecked();
					self._setCheckboxAllStatus(true);
					$('[data-grid-row="' + rowIndex + '"]', self._container).addClass('yom-data-grid-row-checked');
				} else {
					allChecked = false;
					if(self.isAnyChecked()) {
						self._setCheckboxAllStatus(true);
					} else {
						self._setCheckboxAllStatus(false);
					}
					$('[data-grid-row="' + rowIndex + '"]', self._container).removeClass('yom-data-grid-row-checked');
				}
			}
			if(self._opt.onSelect) {
				self._opt.onSelect(rowIndex, checked, rowIndex >= 0 && self._data[rowIndex] || undefined, allChecked);
			}
		}).delegate('.yom-data-grid-row-clickable, .yom-data-grid-cell-clickable', 'click', function(evt) {
			var cellClickable = $(evt.currentTarget).hasClass('yom-data-grid-cell-clickable');
			var target = evt.target;
			if(cellClickable) {
				if(self._rowClickToRef != null) {
					return;
				}
			} else {
				var clickable = $(target).closest('.yom-data-grid-sequence-cell, .yom-data-grid-checkbox-cell').length === 0;
				if(!clickable || !self._opt.onRowClick || self._rowClickToRef != null) {
					return;
				}
			}
			self._rowClickToRef = setTimeout(function() {
				self._rowClickToRef = null;
				var columnId = $(target).closest('[data-grid-column-id]').attr('data-grid-column-id');
				var column = self.getColumnById(columnId);
				var rowIndex = $(target).closest('[data-grid-row]').attr('data-grid-row');
				var headerRowIndex, item;
				if(rowIndex >= 0) {
					item = self._data[rowIndex];
				} else {
					headerRowIndex = $(target).closest('[data-grid-header-row]').attr('data-grid-header-row');
					item = self._headerData[headerRowIndex];
				}
				if(cellClickable) {
					if(column.onClick) {
						column.onClick(evt, rowIndex, item, columnId, column, !!headerRowIndex);
					} else if(self._opt.onCellClick) {
						self._opt.onCellClick(evt, rowIndex, item, columnId, column, !!headerRowIndex);
					} else if(self._opt.onRowClick) {
						self._opt.onRowClick(evt, rowIndex, item, columnId, column, !!headerRowIndex);
					}
				} else {
					self._opt.onRowClick(evt, rowIndex, item, columnId, column, !!headerRowIndex);
				}
			}, self._opt.onRowDblclick ? 300 : 0);
		}).delegate('.yom-data-grid-row-clickable', 'dblclick', function(evt) {
			var cellClickable = $(evt.currentTarget).hasClass('yom-data-grid-cell-clickable');
			var target = evt.target;
			if(!cellClickable) {
				var clickable = $(target).closest('.yom-data-grid-sequence-cell, .yom-data-grid-checkbox-cell').length === 0;
				if(!clickable || !self._opt.onRowDblclick) {
					return;
				}
			}
			clearTimeout(self._rowClickToRef);
			self._rowClickToRef = null;
			var columnId = $(target).closest('[data-grid-column-id]').attr('data-grid-column-id');
			var column = self.getColumnById(columnId);
			var rowIndex = $(target).closest('[data-grid-row]').attr('data-grid-row');
			var headerRowIndex, item;
			if(rowIndex >= 0) {
				item = self._data[rowIndex];
			} else {
				headerRowIndex = $(target).closest('[data-grid-header-row]').attr('data-grid-header-row');
				item = self._headerData[headerRowIndex];
			}
			if(cellClickable) {
				if(column.onDblclick) {
					column.onDblclick(evt, rowIndex, item, columnId, column, !!headerRowIndex);
				} else if(self._opt.onCellDblclick) {
					self._opt.onCellDblclick(evt, rowIndex, item, columnId, column, !!headerRowIndex);
				} else if(self._opt.onRowDblclick) {
					self._opt.onRowDblclick(evt, rowIndex, item, columnId, column, !!headerRowIndex);
				}
			} else {
				self._opt.onRowDblclick(evt, rowIndex, item, columnId, column, !!headerRowIndex);
			}
		});
		this._filterPanel.delegate('[name="findEmpty"]', 'click', function(evt) {
			if(evt.target.checked) {
				self._filterPanel.find('.filter-option').addClass('hidden');
			} else {
				self._filterPanel.find('.filter-option').removeClass('hidden');
			}
		}).delegate('.btn-confirm', 'click', function(evt) {
			self._submitFilterForm();
		}).delegate('.btn-remove', 'click', function(evt) {
			var ele = $(this).closest('[data-column-id]');
			var columnId = ele.attr('data-column-id');
			self._removeFilter(columnId);
		});
		if(this._opt.hightLightRow) {
			this._container.delegate('[data-grid-row]', 'mouseenter', function(evt) {
				$('[data-grid-row]', self._container).removeClass('yom-data-grid-row-hl');
				$('[data-grid-row="' + $(this).attr('data-grid-row') + '"]', self._container).addClass('yom-data-grid-row-hl');
			}).delegate('[data-grid-row]', 'mouseleave', function(evt) {
				$('[data-grid-row="' + $(this).attr('data-grid-row') + '"]', self._container).removeClass('yom-data-grid-row-hl');
			})
			this._container.delegate('[data-grid-header-row]', 'mouseenter', function(evt) {
				$('[data-grid-header-row]', self._container).removeClass('yom-data-grid-row-hl');
				$('[data-grid-header-row="' + $(this).attr('data-grid-header-row') + '"]', self._container).addClass('yom-data-grid-row-hl');
			}).delegate('[data-grid-header-row]', 'mouseleave', function(evt) {
				$('[data-grid-header-row="' + $(this).attr('data-grid-header-row') + '"]', self._container).removeClass('yom-data-grid-row-hl');
			})
		}
		$(document).on('click', this._bind.documentClick);
		if(this._width == 'auto') {
			$(window).on('resize', this._bind.autoResize);
		}
	},

	_unbindEvent: function() {
		this._container.undelegate();
		this._filterPanel.undelegate();
		$(document).off('click', this._bind.documentClick);
		if(this._width == 'auto') {
			$(window).off('resize', this._bind.autoResize);
		}
	},

	_setCheckboxAllStatus: function(checked) {
		var checkbox = $('.yom-data-grid-check-box-all', this._container)[0];
		if(checkbox) {
			checkbox.checked = checked;
			if(this.isAllChecked() || !this.isAnyChecked()) {
				checkbox.indeterminate = false;
			} else {
				checkbox.indeterminate = true;
			}
		}
	},

	_firstRender: function() {
		var that = this;
		this._firstRender = function() {};
		setTimeout(function() {
			that._bind.autoResize();
		}, 0);
	},

	isAllChecked: function() {
		var allChecked = false;
		$('.yom-data-grid-check-box[data-row-index]', this._container).each(function(i, item) {
			if(item.checked && !item.disabled) {
				allChecked = true;
			} else if(!item.disabled) {
				allChecked = false;
				return false;
			}
		});
		return allChecked;
	},

	isAnyChecked: function() {
		var allChecked = false;
		$('.yom-data-grid-check-box[data-row-index]', this._container).each(function(i, item) {
			if(item.checked && !item.disabled) {
				allChecked = true;
				return false;
			}
		});
		return allChecked;
	},

	showSettingPanel: function() {
		this._settingPanel.html(settingPanelTpl.render({
			MAX_LOCKED_COLUMNS: this._MAX_LOCKED_COLUMNS,
			i18n: this._i18n,
			lockColumnAmount: this._lockColumnAmount,
			hiddenColumns: this._hiddenColumns,
			columns: this._allColumns
		}));
		this._updateSettingColumnCheckboxAll();
		this._settingPanel.show();
	},

	showFilterPanel: function(column, target, align) {
		var self = this;
		window.require(['yom-auto-complete'], function (YomAutoComplete) {
			target = $(target);
			self._activeFilterColumn = column;
			var filterOption = column.filterOption;
			var type = filterOption && filterOption.type;
			var offset = target.offset();
			var width = target.outerWidth();
			var height = target.outerHeight();
			var left = offset.left;
			var top = offset.top + height;
			self._filterPanel.html(filterPanelTpl.render({
				i18n: self._i18n,
				column: column,
				filterMap: self._filterMap
			}, {
				normalizeFilterOptions: self.normalizeFilterOptions
			}));
			if(type == 'set' && filterOption.autoComplete) {
				var filterCriteria = self._filterMap[column.id] || {};
				var valueMap = filterCriteria.valueMap || {};
				var box = $('.auto-complete-box', self._filterPanel);
				self._filterPanel.show();
				var autoComplete = new YomAutoComplete(box, $.extend({
					mustSelectInDataSource: true,
					dataSource: filterOption.options,
					initData: Object.keys(valueMap).map(function(id) {
						return {
							id: id,
							name: typeof valueMap[id] == 'string' ? valueMap[id] : id
						};
					}),
					richSelectionResult: true,
					noResultMsg: self._i18n.noResultMsg,
					listMaxHeight: 170,
					listStyle: {
						width: '100%',
						position: 'relative'
					}
				}, filterOption.autoComplete));
				box.data('autoComplete', autoComplete);
			} else if(type == 'date' || type == 'datetime') {
				var pickerOpt = {
					language: self._opt.language,
					bootcssVer: 3,
					fontAwesome: true,
					pickerPosition: 'bottom-left',
					autoclose: true,
					todayBtn: true,
					todayHighlight: true,
					minView: type == 'datetime' ? 0 : 2
				};
				var dateFromDom = $('.date-from', self._filterPanel);
				var dateToDom = $('.date-to', self._filterPanel);
				dateFromDom.datetimepicker($.extend({
					container: dateFromDom[0]
				}, pickerOpt)).on('changeDate', function(evt) {
					var date = new Date(evt.date);
					if(type == 'date') {
						date.setHours(0);
						date.setMinutes(0);
						date.setSeconds(0);
						date.setMilliseconds(0);
					}
					dateFromDom.attr('data-value', date.getTime());
				});
				dateToDom.datetimepicker($.extend({
					container: dateToDom[0]
				}, pickerOpt)).on('changeDate', function(evt) {
					var date = new Date(evt.date);
					if(type == 'date') {
						date.setHours(23);
						date.setMinutes(59);
						date.setSeconds(59);
						date.setMilliseconds(999);
					}
					dateToDom.attr('data-value', date.getTime());
				});
			}
			self._filterPanel.show();
			var filterPanelWidth = self._filterPanel.outerWidth();
			var containerWidth = self._container.outerWidth();
			var containerOffset = self._container.offset();
			if(align == 'right' && (left - containerOffset.left) > filterPanelWidth || left + filterPanelWidth > containerOffset.left + containerWidth) {
				left = left - filterPanelWidth + width;
			}
			self._filterPanel.css({
				left: left + 'px',
				top: top + 'px'
			});
			setTimeout(function() {
				try {
					var el = $('input, select', self._filterPanel)[0];
					el.focus();
					el.readOnly || el.select();
				} catch(e) {}
			}, 0);
		});
	},

	setColumns: function(columns, setting) {
		setting = setting || {};
		this._lockColumnAmount = Math.min(this._MAX_LOCKED_COLUMNS, setting.lockColumnAmount >= 0 ? setting.lockColumnAmount : this._lockColumnAmount);
		this._columnSequence = Array.isArray(setting.columnSequence) && setting.columnSequence.concat() || this._columnSequence;
		this._hiddenColumns = Array.isArray(setting.hiddenColumns) && setting.hiddenColumns.concat() || this._hiddenColumns;
		var self = this;
		var checkbox = this._opt.checkbox;
		var sequence = this._opt.sequence;
		var lockedCount = 0;
		this._allColumns = columns || [];
		this._defaultLockedColumns = [];
		this._lockedColumns = [];
		this._scrollColumns = [];
		if(checkbox) {
			this._defaultLockedColumns.unshift({
				id: '__checkbox__',
				type: 'checkbox',
				width: checkbox.width || this._MIN_COLUMN_WIDTH,
				textAlign: 'center',
				locked: true
			});
		}
		if(sequence) {
			this._defaultLockedColumns.unshift({
				id: '__sequence__',
				name: sequence.name || '',
				type: 'sequence',
				width: sequence.width || this._MIN_COLUMN_WIDTH,
				textAlign: 'center',
				locked: true
			});
		}
		this._allColumns = mergeSort(this._allColumns, function(a, b) {
			var as = self._columnSequence.indexOf(a.id);
			var bs = self._columnSequence.indexOf(b.id);
			as = as >= 0 ? as : 9999;
			bs = bs >= 0 ? bs : 9999;
			return as - bs;
		});
		$.each(this._allColumns, function(i, column) {
			if(column) {
				column.width = parseInt(column.width) || 0;
				if(column.width > 0) {
					column.width = Math.min(Math.max(column.width, self._MIN_COLUMN_WIDTH), self._MAX_COLUMN_WIDTH);
				}
				if(self._hiddenColumns.indexOf(column.id) >= 0) {
					column.hidden = true;
				} else {
					column.hidden = false;
				}
				if(lockedCount < self._lockColumnAmount) {
					column.width = column.width || self._DEFAULT_COLUMN_WIDTH;
					column.width = Math.min(column.width, self._MAX_LOCKED_COLUMN_WIDTH);
					column.locked = true;
					self._lockedColumns.push(column);
					column.hidden || lockedCount++;
				} else {
					column.locked = false;
					self._scrollColumns.push(column);
				}
			}
		});
	},

	getScrollLeft: function() {
		return this._scrollLeft;
	},

	getScrollTop: function() {
		return this._scrollTop;
	},

	getColumnById: function(id) {
		var column = this._allColumns.filter(function(item) {
			return item.id == id;
		})[0];
		return column;
	},

	getAllColumns: function() {
		return this._lockedColumns.concat(this._scrollColumns);
	},

	getLockedColumns: function() {
		return this._lockedColumns.concat();
	},

	getScrollColumns: function() {
		return this._scrollColumns.concat();
	},

	getSelectedIndex: function() {
		var self = this;
		var res = [];
		$('.yom-data-grid-check-box', this._container).each(function(i, item) {
			var index = parseInt($(this).attr('data-row-index'));
			if(this.checked && index >= 0) {
				res.push(index);
			}
		});
		return res;
	},

	getSelectedData: function(dataProperty, columnId) {
		var self = this;
		var res = [];
		$('.yom-data-grid-check-box', this._container).each(function(i, item) {
			var index = $(this).attr('data-row-index');
			if(item.checked) {
				res.push(self.getDataByRowIndex(index, dataProperty, columnId));
			}
		});
		if(this._opt.maxSelection > 0) {
			res = res.slice(0, this._opt.maxSelection);
		}
		return res;
	},

	getDataByRowIndex: function(rowIndex, dataProperty, columnId) {
		var res = this._data[rowIndex];
		if(!res) {
			return null;
		}
		if(dataProperty) {
			res = columnId ? res[dataProperty][columnId] : res[dataProperty];
		} else {
			res = columnId ? res[columnId] : res;
		}
		return res;
	},

	getSelection: function(rowIndex) {
		var checkbox = $('[data-grid-row="' + rowIndex + '"] .yom-data-grid-check-box')[0];
		if(!checkbox || checkbox.disabled) {
			return false;
		}
		return checkbox.checked;
	},

	setSelection: function(rowIndex, checked) {
		checked = !!checked;
		if(checked && this._opt.maxSelection > 0 && this.getSelectedIndex().length >= this._opt.maxSelection) {
			this._opt.onExceedMaxSelection && this._opt.onExceedMaxSelection(this._opt.maxSelection);
			return false;
		}
		var checkbox = $('[data-grid-row="' + rowIndex + '"] .yom-data-grid-check-box')[0];
		if(!checkbox || checkbox.disabled || checkbox.checked == checked) {
			return false;
		}
		var allChecked = true;
		checkbox.checked = checked;
		if(checked) {
			allChecked = this.isAllChecked();
			this._setCheckboxAllStatus(true);
			$('[data-grid-row="' + rowIndex + '"]', this._container).addClass('yom-data-grid-row-checked');
		} else {
			allChecked = false;
			if(this.isAnyChecked()) {
				this._setCheckboxAllStatus(true);
			} else {
				this._setCheckboxAllStatus(false);
			}
			$('[data-grid-row="' + rowIndex + '"]', this._container).removeClass('yom-data-grid-row-checked');
		}
		if(this._opt.onSelect) {
			this._opt.onSelect(rowIndex, checked, this._data[rowIndex], allChecked);
		}
		return true;
	},

	toggleSelection: function(rowIndex) {
		var checked = this.getSelection(rowIndex);
		var res = this.setSelection(rowIndex, !checked);
		return res ? (checked ? -1 : 1) : 0;
	},

	setAllSelection: function(checked) {
		var self = this;
		$('.yom-data-grid-check-box, .yom-data-grid-check-box-all', this._container).each(function(i, item) {
			if(!item.disabled) {
				var rowIndex = $(item).closest('[data-grid-row]').attr('data-grid-row');
				item.checked = !!checked;
				if(rowIndex >= 0) {
					if(checked) {
						$('[data-grid-row="' + rowIndex + '"]', self._container).addClass('yom-data-grid-row-checked');
					} else {
						$('[data-grid-row="' + rowIndex + '"]', self._container).removeClass('yom-data-grid-row-checked');
					}
				}
			}
		});
		this._setCheckboxAllStatus(checked);
	},

	hightLightRow: function(index, className) {
		$('[yom-data-grid-row="' + index + '"]', this._container).addClass(className || 'yom-data-grid-row-error');
	},

	dehightLightRows: function(className) {
		$('[yom-data-grid-row]', this._container).removeClass(className || 'yom-data-grid-row-error');
	},

	getSetting: function() {
		return {
			lockColumnAmount: this._lockColumnAmount,
			columnSequence: this._columnSequence.concat(),
			hiddenColumns: this._hiddenColumns.concat()
		};
	},

	getState: function() {
		return {
			sortOrder: this._sortOrder,
			sortColumnId: this._sortColumnId,
			filterMap: $.extend({}, this._filterMap)
		};
	},

	normalizeFilterOptions: function(options) {
		var options = options || [];
		if(!Array.isArray(options)) {
			var tmp = [];
			for(var p in options) {
				if(options.hasOwnProperty(p)) {
					tmp.push({value: p, name: options[p]});
				}
			}
			options = tmp;
		} else {
			options = options.map(function(option) {
				var value, name;
				if(typeof option == 'string') {
					value = option;
					name = option;
				} else {
					value = option.id || option.key || option.val || option.value;
					name = option.label || option.name || option.value || option.val;
				}
				return {
					value: value,
					name: name
				};
			});
		}
		return options;
	},

	parseFilterMap: function(filterMap) {
		var self = this;
		var res = {};
		if(typeof filterMap == 'string') {
			decodeURIComponent(filterMap).split(';').forEach(function(item) {
				if(!item) {
					return;
				}
				var filterCriteria = {};
				var parts  = item.split(',');
				var column = self.getColumnById(parts.shift());
				if(column) {
					var filterOption = column.filterOption || {};
					filterCriteria.type = filterOption.type;
					filterCriteria.findEmpty = parts.shift() == '1';
					parts.shift(); // data type indicator
					if(filterCriteria.findEmpty) {
						filterCriteria.displayValue = self._i18n.empty;
					} else {
						var value;
						if(filterOption.type == 'set') {
							value = parts;
							var options = self.normalizeFilterOptions(filterOption.options);
							var valueMap = {};
							displayValue = [];
							value.forEach(function(id) {
								var option = options.find(function(option) {
									return option.value == id;
								});
								option && displayValue.push(option.name);
								valueMap[id] = self._opt.getOptionNameById && self._opt.getOptionNameById(id) || 1;
							});
							filterCriteria.valueMap = valueMap;
							filterCriteria.value = value;
							filterCriteria.displayValue = displayValue.join(', ');
						} else if(filterOption.type == 'number') {
							var compareType = parts.shift();
							value = parseFloat(parts.shift()) || '';
							filterCriteria.compareType = compareType;
							filterCriteria.value = value;
							filterCriteria.displayValue = (self._i18n[compareType] || '') + ' ' + value;
						} else if(filterOption.type == 'date' || filterOption.type == 'datetime') {
							var fromValue = (filterOption.parser || parseInt)(parts.shift());
							var toValue = (filterOption.parser || parseInt)(parts.shift());
							if(fromValue) {
								filterCriteria.fromValue = fromValue;
								filterCriteria.fromDisplay = filterOption.formatter(fromValue);
							}
							if(toValue) {
								filterCriteria.toValue = toValue;
								filterCriteria.toDisplay = filterOption.formatter(toValue);
							}
							filterCriteria.displayValue = (fromValue ? filterCriteria.fromDisplay : '') + ' ~ ' + (toValue ? filterCriteria.toDisplay : '');
						} else {
							value = parts.join(',');
							filterCriteria.value = value;
							filterCriteria.displayValue = value;
						}
					}
					res[column.id] = filterCriteria;
				}
			});
		} else {
			res = filterMap;
		}
		return res;
	},

	getFilterMapString: function(filterMap) {
		filterMap = filterMap || this._filterMap;
		if(typeof filterMap == 'string') {
			return filterMap;
		}
		var filters = [];
		for(var p in filterMap) {
			if(Object.prototype.hasOwnProperty.call(filterMap, p)) {
				var criteria = filterMap[p];
				if(this._opt.getFilterMapItemForStringify) {
					criteria = this._opt.getFilterMapItemForStringify(criteria);
				}
				if(criteria.findEmpty) {
					filters.push(p + ',1');
				} else {
					if(criteria.type == 'set') {
						filters.push(p + ',0,set,' + criteria.value.join(','));
					} else if(criteria.type == 'number') {
						filters.push(p + ',0,number,' + criteria.compareType + ',' +  criteria.value);
					} else if(criteria.type == 'date') {
						filters.push(p + ',0,date,' + (criteria.fromValue || '') + ',' +  (criteria.toValue || ''));
					} else if(criteria.type == 'datetime') {
						filters.push(p + ',0,datetime,' + (criteria.fromValue || '') + ',' +  (criteria.toValue || ''));
					} else {
						filters.push(p + ',0,,' + criteria.value);
					}
				}
			}
		}
		return filters.join(';');
	},

	getQueryString: function() {
		var all = [];
		var filterMapString = this.getFilterMapString();
		if(this._sortColumnId) {
			all.push('sortBy=' + encodeURIComponent(this._sortColumnId));
		}
		if(this._sortOrder) {
			all.push('sortOrder=' + this._sortOrder);
		}
		if(filterMapString) {
			all.push('filters=' + encodeURIComponent(filterMapString));
		}
		return all.join('&');
	},

	isExportSupported: function() {
		return 'Blob' in window;
	},

	export: function(data, fileName, format) {
		if(!this.isExportSupported) {
			throw new Error('Export is not supported!');
		}
		data = data || this._data;
		var columns = this._lockedColumns.concat(this._scrollColumns).filter(function (column) {
			return !column.hidden;
		});
		if (format == 'csv') {
			return exportMod.exportCsv(data, columns, fileName);
		} else {
			return exportMod.exportXlsx(data, columns, fileName);
		}
	},

	render: function(data, headerData, state, setting, opt) {
		if(!this._holder) {
			return;
		}
		opt = opt || {};
		var selectedIndex = opt.selectedIndex || [];
		if(this._opt.maxSelection > 0) {
			selectedIndex = selectedIndex.slice(0, this._opt.maxSelection);
		}
		if(data && data.length) {
			this._data = data;
		}
		if(headerData && headerData.length) {
			this._headerData = headerData;
		}
		if(state) {
			this._sortColumnId = state.sortColumnId || this._sortColumnId;
			this._sortOrder = state.sortOrder || this._sortOrder;
			this._setFilterMap(state.filterMap);
		}
		if(setting) {
			this.setColumns(this._allColumns, setting);
		}
		if(this._opt.onBeforeRender) {
			this._opt.onBeforeRender();
		}
		$('.yom-data-grid-header, .yom-data-grid-body', this._container).off('wheel', this._bind.scrollLocked);
		if(this._lockedBody) {
			$(this._lockedBody).off('wheel', this._bind.scrollLocked);
		}
		this._lockedBody = null;
		this._scrollHeader = null;
		this._scrollBody = null;
		this._settingPanel = null;
		var noScrollX = false;
		var width;
		if(this._allColumns.length - this._hiddenColumns.length < this._opt.minScrollXColumns || this._width == '100%') {
			noScrollX = true;
			width = '100%';
		} else {
			width = this._width == 'auto' ? this._holder.width() : this._width;
		}
		if(!width && this._opt.getHolderWidth) {
			width = this._opt.getHolderWidth();
		}
		this._container.html(mainTpl.render({
			DEFAULT_COLUMN_WIDTH: this._DEFAULT_COLUMN_WIDTH,
			i18n: this._i18n,
			name: this._name,
			width: width,
			noScrollX: noScrollX,
			lockedColumns: this._defaultLockedColumns.concat(this._lockedColumns),
			scrollColumns: this._scrollColumns,
			bordered: this._opt.bordered,
			striped: this._opt.striped,
			sortColumnId: this._sortColumnId,
			sortOrder: this._sortOrder,
			filterMap: this._filterMap,
			checkbox: this._opt.checkbox,
			data: this._data,
			headerData: this._headerData,
			dataProperty: this._opt.dataProperty,
			isAllChecked: opt.isAllChecked,
			selectedIndex: opt.selectedIndex || [],
			maxSelection: this._opt.maxSelection,
			disableSetting: this._opt.disableSetting,
			opt: this._opt
		}));
		this._lockedBody = $('.yom-data-grid-locked-columns .yom-data-grid-body', this._container)[0];
		this._scrollHeader = $('.yom-data-grid-columns .yom-data-grid-header', this._container)[0];
		this._scrollBody = $('.yom-data-grid-columns .yom-data-grid-body', this._container);
		this._scrollBody.on('scroll', this._bind.scroll);
		$('.yom-data-grid-header, .yom-data-grid-body', this._container).on('wheel', this._bind.scrollLocked);
		this._settingPanel = $('.yom-data-grid-setting-panel', this._container);
		var scrollBody = this._scrollBody[0];
		if(scrollBody) {
			if(this._scrollLeft) {
				scrollBody.scrollLeft = this._scrollLeft;
			}
			if(this._scrollTop) {
				scrollBody.scrollTop = this._scrollTop;
			}
		}
		this._firstRender();
		if(this._opt.onRender) {
			this._opt.onRender();
		}
	},

	destroy: function() {
		if(this._scrollBody) {
			this._scrollBody.off('scroll', this._bind.scroll);
		}
		this._unbindEvent();
		this._container.remove();
		this._filterPanel.remove();
		this._container = null;
		this._lockedBody = null;
		this._scrollHeader = null;
		this._scrollBody = null;
		this._holder = null;
	}
});

module.exports = YomDataGrid;


/***/ })
/******/ ]);
});