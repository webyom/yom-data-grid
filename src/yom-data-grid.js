var $ = require('jquery');
var mainTpl = require('./yom-data-grid.tpl.html');
var filterPanelTpl = require('./filter-panel.tpl.html');
var settingPanelTpl = require('./setting-panel.tpl.html');
var i18n = require('./i18n');
var mergeSort = require('./merge-sort');
var exportMod = require('./export');
require('./yom-data-grid.less');

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

	// store tmp data during rendering
	this._tmp = {};

	// sortting
	this._sortBy = '';
	this._sortOrder = '';

	// filter
	this._filterMap = {};
	this._activeFilterColumn = null;

	// column sortting & lock & hidden
	this._lockColumnAmount = 0;
	this._columnSequence = [];
	this._hiddenColumns = [];

	this._lastRowMousedownPos = [0, 0];
	this._lastRowClickTime = 0;
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

	this.setColumns(columns, opt.setting || this.getSetting());
	this._bindEvent();
};

YomDataGrid.getVisibleColumns = function(columns, setting) {
	columns = columns || [];
	setting = setting || {};
	if(Array.isArray(setting.columnSequence)) {
		columns = mergeSort(columns, function(a, b) {
			var as = setting.columnSequence.indexOf(a.id);
			var bs = setting.columnSequence.indexOf(b.id);
			as = as >= 0 ? as : -9999;
			bs = bs >= 0 ? bs : -9999;
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
	_MAX_LOCKED_COLUMNS: 4,
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
			if(y > 0 && scrollBody.clientHeight + top < scrollBody.scrollHeight || y < 0 && top > 0) {
				evt.preventDefault();
			}
		}
	},

	_clientSort: function() {
		var sortOrder = this._sortOrder;
		var columnId = this._sortBy;
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
			if(item.checked) {
				checkedCount++;
			} else if(!item.disabled) {
				uncheckedCount++;
			}
		});
		if(checkedCount && uncheckedCount) {
			checkboxAll.checked = true;
			checkboxAll.indeterminate = true;
		} else if(checkedCount) {
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
		var hiddenColumns = $('.columns-container input:not(:checked,:disabled)', this._settingPanel).map(function(i, item) {
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

		$('[name="value"]', this._filterPanel).off('paste');

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
				if(compareType == 'range') {
					var fromValueEl = $('[name="fromValue"]', this._filterPanel);
					var toValueEl = $('[name="toValue"]', this._filterPanel);
					var fromValue = parseFloat(fromValueEl.val());
					var toValue = parseFloat(toValueEl.val());
					if(isNaN(fromValue) && isNaN(toValue)) {
						this._showFilterErrMsg(this._i18n.atLeastOneRangeValueRequired);
						return;
					}
					if(fromValue >= toValue) {
						this._showFilterErrMsg(this._i18n.rangeStartNotLessThanEnd);
						return;
					}
					filterCriteria.fromValue = fromValue;
					filterCriteria.toValue = toValue;
				} else {
					valueEl = $('[name="value"]', this._filterPanel);
					value = parseFloat(valueEl.val());
					if(isNaN(value)) {
						this._showFilterErrMsg(this._i18n.compareValueRequired);
						return;
					}
					filterCriteria.value = value;
				}
				filterCriteria.compareType = compareType;
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
		this._filterMap[this.getFilterKeyById(column.id)] = filterCriteria;
		this._hideFilterPanel();
		if(this._opt.onStateChange) {
			this._opt.onStateChange(this.getState());
		}
	},

	_removeFilter: function(columnId) {
		this._hideFilterPanel();
		delete this._filterMap[this.getFilterKeyById(columnId)];
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
			self._sortBy = self.getSortKeyById(columnId);
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
				if(item.disabled) {
					return;
				}
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
		}).delegate('.yom-data-grid-row-clickable, .yom-data-grid-cell-clickable', 'mousedown', function(evt) {
			self._lastRowMousedownPos = [evt.pageX, evt.pageY];
		}).delegate('.yom-data-grid-cell-clickable', 'click', function(evt) {
			var target = evt.target;
			var rowClickTime = new Date().getTime();
			self._lastRowClickTime = rowClickTime;
			var columnId = $(target).closest('[data-grid-column-id]').attr('data-grid-column-id');
			var column = self.getColumnById(columnId);
			var rowIndex = +$(target).closest('[data-grid-row]').attr('data-grid-row');
			var isHeaderRow = false, item;
			if(rowIndex >= 0) {
				item = self._data[rowIndex];
			} else {
				isHeaderRow = true;
				rowIndex = +$(target).closest('[data-grid-header-row]').attr('data-grid-header-row');
				item = self._headerData[headerRowIndex];
			}
			if(column.onClick) {
				column.onClick(evt, rowIndex, item, columnId, column, isHeaderRow);
			} else if(self._opt.onCellClick) {
				self._opt.onCellClick(evt, rowIndex, item, columnId, column, isHeaderRow);
			} else if(self._opt.onRowClick) {
				self._opt.onRowClick(evt, rowIndex, item, columnId, column, isHeaderRow);
			}
		}).delegate('.yom-data-grid-row-clickable', 'click', function(evt) {
			clearTimeout(self._rowClickToRef);
			var target = evt.target;
			var rowClickTime = new Date().getTime();
			var lastRowClickTime = self._lastRowClickTime;
			self._lastRowClickTime = rowClickTime;
			if(rowClickTime - lastRowClickTime < 300 || Math.abs(evt.pageX - self._lastRowMousedownPos[0]) > 3 || Math.abs(evt.pageY - self._lastRowMousedownPos[1]) > 3) {
				return;
			}
			var clickable = $(target).closest('.yom-data-grid-sequence-cell, .yom-data-grid-checkbox-cell, .yom-data-grid-form-cell').length === 0;
			if(!clickable || !self._opt.onRowClick) {
				return;
			}
			self._rowClickToRef = setTimeout(function() {
				var columnId = $(target).closest('[data-grid-column-id]').attr('data-grid-column-id');
				var column = self.getColumnById(columnId);
				var rowIndex = +$(target).closest('[data-grid-row]').attr('data-grid-row');
				var isHeaderRow = false, item;
				if(rowIndex >= 0) {
					item = self._data[rowIndex];
				} else {
					isHeaderRow = true;
					rowIndex = +$(target).closest('[data-grid-header-row]').attr('data-grid-header-row');
					item = self._headerData[headerRowIndex];
				}
				self._opt.onRowClick(evt, rowIndex, item, columnId, column, isHeaderRow);
			}, 300);
		});
		this._filterPanel.delegate('[name="findEmpty"]', 'click', function(evt) {
			if(evt.target.checked) {
				self._filterPanel.find('.filter-option').addClass('hidden');
			} else {
				self._filterPanel.find('.filter-option').removeClass('hidden');
			}
		}).delegate('.btn-remove', 'click', function(evt) {
			var ele = $(this).closest('[data-column-id]');
			var columnId = ele.attr('data-column-id');
			self._removeFilter(columnId);
		}).delegate('.btn-check-all', 'click', function(evt) {
			$('.set-container input', self._filterPanel).each(function(i, item) {
				item.checked = true;
			});
		}).delegate('.btn-uncheck-all', 'click', function(evt) {
			$('.set-container input', self._filterPanel).each(function(i, item) {
				item.checked = false;
			});
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

	_unmoundReactComponents: function(cb) {
		var reactElements = $('[data-react-element]', this._container);
		if(reactElements.length) {
			window.require(['react-dom'], function(ReactDOM) {
				reactElements.each(function(i, el) {
					ReactDOM.unmountComponentAtNode(el.firstChild);
				});
				cb();
			});
		} else {
			cb();
		}
	},

	_render: function(data, headerData, state, setting, opt) {
		var that = this;
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
			this._sortBy = state.sortBy || this._sortBy;
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
		this._tmp.reactElements = [];
		this._tmp.headerReactElements = [];
		this._container.html(mainTpl.render({
			_this: this,
			DEFAULT_COLUMN_WIDTH: this._DEFAULT_COLUMN_WIDTH,
			i18n: this._i18n,
			name: this._name,
			width: width,
			noScrollX: noScrollX,
			lockedColumns: this._defaultLockedColumns.concat(this._lockedColumns),
			scrollColumns: this._scrollColumns,
			bordered: this._opt.bordered,
			striped: this._opt.striped,
			sortBy: this._sortBy,
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
		if(this._tmp.reactElements.length || this._tmp.headerReactElements.length) {
			window.require(['react-dom'], function(ReactDOM) {
				$('[data-react-element]', that._container).each(function(i, el) {
					var attrs = el.getAttribute('data-react-element').split('-');
					var reactElements = attrs[2] == 'header' ? that._tmp.headerReactElements : that._tmp.reactElements;
					var reactElement = reactElements[attrs[0]][attrs[1]];
					ReactDOM.render(reactElement, el.firstChild);
				});
				that._tmp.reactElements = null;
				that._tmp.headerReactElements = null;
				that._opt.onRender && that._opt.onRender();
			});
		} else {
			this._opt.onRender && this._opt.onRender();
		}
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
			self._filterPanel.find('form').off('submit');
			self._filterPanel.html(filterPanelTpl.render({
				i18n: self._i18n,
				column: column,
				filterMap: self._filterMap,
				dateFormat: self._opt.dateFormat,
				datetimeFormat: self._opt.datetimeFormat
			}, {
				normalizeFilterOptions: self.normalizeFilterOptions
			}));
			if(type == 'set' && filterOption.autoComplete) {
				var filterCriteria = self._filterMap[this.getFilterKeyById(column.id)] || {};
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
					minView: type == 'datetime' ? 0 : 2,
					minuteStep: 1
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
					}
					date.setSeconds(0);
					date.setMilliseconds(0);
					dateFromDom.attr('data-value', date.getTime());
				});
				dateToDom.datetimepicker($.extend({
					container: dateToDom[0]
				}, pickerOpt)).on('changeDate', function(evt) {
					var date = new Date(evt.date);
					if(type == 'date') {
						date.setHours(23);
						date.setMinutes(59);
					}
					date.setSeconds(59);
					date.setMilliseconds(999);
					dateToDom.attr('data-value', date.getTime());
				});
			} else if(type == 'number') {
				self._filterPanel.find('[name="compareType"]').on('change', function(evt) {
					var formAndToValueEl = $('[name="fromValue"], [name="toValue"]', self._filterPanel).closest('.form-group');
					var valueEl = $('[name="value"]', self._filterPanel).closest('.form-group');
					if(evt.currentTarget.value == 'range') {
						formAndToValueEl.removeClass('hidden');
						valueEl.addClass('hidden');
					} else {
						formAndToValueEl.addClass('hidden');
						valueEl.removeClass('hidden');
					}
				});
			} else {
				$('[name="value"]', self._filterPanel).on('paste', function(evt) {
					var text = '';
					try {
						text = evt.originalEvent.clipboardData.getData('text');
					} catch(e) {}
					var newText = text.trim().replace(/[\r\n]+/g, ',');
					var input = this;
					var oldValue = input.value.trim();
					var prefix = oldValue.slice(0, this.selectionStart);
					var postfix = oldValue.slice(this.selectionEnd);
					if(text != newText) {
						setTimeout(function() {
							input.value = prefix + newText + postfix;
							input.selectionStart = input.selectionEnd = (prefix + newText).length;
						}, 0);
					}
				});
			}
			self._filterPanel.find('form').on('submit', function(evt) {
				evt.preventDefault();
				self._submitFilterForm();
			});
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
			as = as >= 0 ? as : -9999;
			bs = bs >= 0 ? bs : -9999;
			return as - bs;
		});
		$.each(this._allColumns, function(i, column) {
			if(column) {
				column.width = parseInt(column.width) || 0;
				if(column.width > 0) {
					column.width = Math.min(Math.max(column.width, self._MIN_COLUMN_WIDTH), self._MAX_COLUMN_WIDTH);
				}
				if(column.searchOnly || self._hiddenColumns.indexOf(column.id) >= 0) {
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

	getColumnByFilterKey: function(key) {
		var column = this._allColumns.filter(function(item) {
			return item.filterable && (item.filterKey == key || item.id == key);
		})[0];
		return column;
	},

	getFilterKeyById: function(id) {
		var column = this.getColumnById(id);
		return column && column.filterKey || id;
	},

	getSortKeyById: function(id) {
		var column = this.getColumnById(id);
		return column && column.sortKey || id;
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

	getData: function() {
		return {
			data: this._data,
			headerData: this._headerData
		};
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
			sortBy: this._sortBy,
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
					['id', 'key', 'code', 'val', 'value'].find(function (key) {
						if (option[key] != null) {
							value = option[key];
							return true;
						}
					});
					['label', 'name', 'value', 'val'].find(function (key) {
						if (option[key] != null) {
							name = option[key];
							return true;
						}
					});
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
				var column = self.getColumnByFilterKey(parts.shift());
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
							if(compareType == 'range') {
								var fromValue = parseFloat(parts.shift());
								var toValue = parseFloat(parts.shift());
								filterCriteria.fromValue = fromValue;
								filterCriteria.toValue = toValue;
								filterCriteria.displayValue = (self._i18n[compareType] || '') + ' ' + (fromValue === 0 ? 0 : (fromValue || '')) + ' ~ ' + (toValue === 0 ? 0 : (toValue || ''));
							} else {
								value = parseFloat(parts.shift());
								filterCriteria.value = value;
								filterCriteria.displayValue = (self._i18n[compareType] || '') + ' ' + (value === 0 ? 0 : (value || ''));
							}
							filterCriteria.compareType = compareType;
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
					res[self.getFilterKeyById(column.id)] = filterCriteria;
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
						if(criteria.compareType == 'range') {
							filters.push(p + ',0,number,' + criteria.compareType + ',' +  (criteria.fromValue || '') + ',' +  (criteria.toValue || ''));
						} else {
							filters.push(p + ',0,number,' + criteria.compareType + ',' +  (criteria.value || ''));
						}
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
		if(this._sortBy) {
			all.push('sortBy=' + encodeURIComponent(this._sortBy));
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
		if(format == 'csv') {
			return exportMod.exportCsv(data, columns, fileName);
		} else {
			return exportMod.exportXlsx(data, columns, fileName);
		}
	},

	render: function(data, headerData, state, setting, opt) {
		if(!this._holder) {
			return;
		}
		this._unmoundReactComponents(this._render.bind(this, data, headerData, state, setting, opt));
	},

	destroy: function() {
		if(this._scrollBody) {
			this._scrollBody.off('scroll', this._bind.scroll);
		}
		this._unbindEvent();

		var container = this._container;
		this._unmoundReactComponents(function() {
			container.remove();
		});

		this._filterPanel.remove();
		this._container = null;
		this._lockedBody = null;
		this._scrollHeader = null;
		this._scrollBody = null;
		this._holder = null;
	}
});

module.exports = YomDataGrid;
