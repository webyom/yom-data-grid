var $ = window.jQuery || window.$;
var mainTpl = require('./yom-data-grid.tpl.html');
var filterPanelTpl = require('./filter-panel.tpl.html');
var settingPanelTpl = require('./setting-panel.tpl.html');
require('./yom-data-grid.less');

var YomDataGrid = function(holder, columns, opt) {
	var self = this;
	opt = opt || {};
	this._opt = opt;
	this._name = opt.name || 'x';
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
	this._lockedBody = null;
	this._scrollHeader = null;
	this._scrollBody = null;
	
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
	
	this._bind = {
		scroll: function(evt) {return self._onScroll(evt);},
		documentClick: function(evt) {
			self._hideFilterPanel(evt);
			self._hideSettingPanel(evt);
		}
	};
	
	this.setColumns(columns, this.getSetting());
	this._bindEvent();
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
			this._lockedBody.scrollTop = target.scrollTop;
		}
		if(this._scrollHeader) {
			this._scrollHeader.scrollLeft = target.scrollLeft;
		}
		this._hideFilterPanel();
		this._hideSettingPanel();
	},

	_clientSort: function() {
		var sortOrder = this._sortOrder;
		var columnId = this._sortColumnId;
		var dataProperty = this._opt.dataProperty;
		this._data.sort(function(a, b) {
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
	
	_showSettingPanel: function() {
		this._settingPanel.html(settingPanelTpl.render({
			MAX_LOCKED_COLUMNS: this._MAX_LOCKED_COLUMNS,
			lockColumnAmount: this._lockColumnAmount,
			hiddenColumns: this._hiddenColumns,
			columns: this._allColumns
		}))
		this._settingPanel.show();
	},
	
	_hideSettingPanel: function(evt) {
		if(evt) {
			var target = $(evt.target);
			if(target.hasClass('yom-data-grid-setting-icon') || target.closest('.yom-data-grid-setting-icon').length) {
				return;
			}
			if((target.hasClass('yom-data-grid-setting-panel') || target.closest('.yom-data-grid-setting-panel').length) && target.data('toggle') != 'yom-data-grid-setting-panel') {
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
			this._showSettingErrMsg('至少显示一列');
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
		if(evt) {
			var target = $(evt.target);
			if(target.hasClass('yom-data-grid-filter-icon') || target.closest('.yom-data-grid-filter-icon').length) {
				return;
			}
			if((target.hasClass('yom-data-grid-filter-panel') || target.closest('.yom-data-grid-filter-panel').length) && target.data('toggle') != 'yom-data-grid-filter-panel') {
				return;
			}
		}
		this._filterPanel && this._filterPanel.hide();
		this._activeFilterColumn = null;
	},
	
	_showFilterErrMsg: function(msg) {
		$('.alert-danger', this._filterPanel).html(msg).removeClass('hidden');
	},
	
	_submitFilterForm: function() {
		var findEmpty = $('[name="findEmpty"]', this._filterPanel).prop('checked');
		var column = this._activeFilterColumn;
		var filterOption = column.filterOption || {};
		var filterCriteria = {};
		var value, valueEl;
		if(!findEmpty) {
			if(filterOption.type == 'set') {
				value = [];
				var valueMap = {};
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
					this._showFilterErrMsg('请选择筛选条件');
					return;
				}
				filterCriteria.valueMap = valueMap;
				filterCriteria.value = value;
			} else if(filterOption.type == 'number') {
				var compareType = $('[name="compareType"]', this._filterPanel).val();
				valueEl = $('[name="value"]', this._filterPanel);
				if((/[,;]/).test(valueEl.val())) {
					this._showFilterErrMsg('不能输入“,”和“;”');
					return;
				}
				value = parseFloat($.trim(valueEl.val()));
				if(isNaN(value)) {
					this._showFilterErrMsg('请输入比较值');
					return;
				}
				filterCriteria.compareType = compareType;
				filterCriteria.value = value;
			} else {
				valueEl = $('[name="value"]', this._filterPanel);
				if((/[,;]/).test(valueEl.val())) {
					this._showFilterErrMsg('不能输入“,”和“;”');
					return;
				}
				value = $.trim(valueEl.val());
				if(!value) {
					this._showFilterErrMsg('请输入筛选条件');
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
			var columnId = $(this).closest('[data-column-id]').data('column-id');
			var sortOrder = $('.yom-data-grid-sort-arrow-down', this).length ? 'asc' : 'desc';
			self._sortOrder = sortOrder;
			self._sortColumnId = columnId;
			if(self._opt.clientSort) {
				self._clientSort();
			} else if(self._opt.onStateChange) {
				self._opt.onStateChange(self.getState());
			}
		}).delegate('.yom-data-grid-setting-icon', 'click', function(evt) {
			self._showSettingPanel();
		}).delegate('.yom-data-grid-btn-confirm-setting', 'click', function(evt) {
			self._submitSettingForm();
		}).delegate('.yom-data-grid-setting-column-item', 'click', function(evt) {
			$('.yom-data-grid-setting-column-item', self._container).removeClass('selected');
			$(this).addClass('selected');
			self._updateColumnSortBtnStatus();
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
			var columnId = cell.data('column-id');
			var column = self.getColumnById(columnId);
			if(column) {
				self.showFilterPanel(column, $(this), 'right');
			}
		}).delegate('.yom-data-grid-filter-remove-icon', 'click', function(evt) {
			var cell = $(this).closest('[data-column-id]');
			var columnId = cell.data('column-id');
			self._removeFilter(columnId);
		}).delegate('.yom-data-grid-check-box, .yom-data-grid-check-box-all', 'click', function(evt) {
			var rowIndex = $(this).data('row-index');
			var allChecked = true;
			var checked = this.checked;
			if(!(rowIndex >= 0)) {//all
				self.setAllSelection(checked);
			} else {
				if(checked) {
					$('.yom-data-grid-check-box[data-row-index]', self._container).each(function(i, item) {
						if(!item.checked) {
							allChecked = false;
							return false;
						}
					});
					if(allChecked) {
						$('.yom-data-grid-check-box-all', self._container)[0].checked = true;
						$('.yom-data-grid-check-box-all', self._container).closest('.mockup-checkbox').addClass('on');
					}
				} else {
					$('.yom-data-grid-check-box-all', self._container)[0].checked = false;
					$('.yom-data-grid-check-box-all', self._container).closest('.mockup-checkbox').removeClass('on');
				}
			}
			if(self._opt.onSelect) {
				self._opt.onSelect(rowIndex, checked, rowIndex >= 0 && self._data[rowIndex] || undefined);
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
			var columnId = ele.data('column-id');
			self._removeFilter(columnId);
		});
		if(this._opt.hightLightRow) {
			this._container.delegate('[data-grid-row]', 'mouseenter', function(evt) {
				$('[data-grid-row]', self._container).removeClass('yom-data-grid-row-hl');
				$('[data-grid-row="' + $(this).data('grid-row') + '"]', self._container).addClass('yom-data-grid-row-hl');
			}).delegate('[data-grid-row]', 'mouseleave', function(evt) {
				$('[data-grid-row="' + $(this).data('grid-row') + '"]', self._container).removeClass('yom-data-grid-row-hl');
			})
		}
		$(document).on('click', this._bind.documentClick);
	},

	_unbindEvent: function() {
		this._container.undelegate();
		this._filterPanel.undelegate();
		$(document).off('click', this._bind.documentClick);
	},
	
	showFilterPanel: function(column, target, align) {
		target = $(target);
		this._activeFilterColumn = column;
		var offset = target.offset();
		var width = target.outerWidth();
		var height = target.outerHeight();
		var left = offset.left;
		var top = offset.top + height;
		this._filterPanel.html(filterPanelTpl.render({
			column: column,
			filterMap: this._filterMap
		}));
		this._filterPanel.show();
		var filterPanelWidth = this._filterPanel.outerWidth();
		if (align == 'right') {
			if(left > filterPanelWidth) {
				left = left - filterPanelWidth + width;
			}
		}
		this._filterPanel.css({
			left: left + 'px',
			top: top + 'px'
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
		this._allColumns.sort(function(a, b) {
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

	getSelectedData: function(dataProperty, columnId) {
		var self = this;
		var res = [];
		$('.yom-data-grid-check-box', this._container).each(function(i, item) {
			var index = $(this).data('row-index');
			if(item.checked) {
				if(dataProperty) {
					res.push(columnId ? self._data[index][dataProperty][columnId] : self._data[index][dataProperty]);
				} else {
					res.push(columnId ? self._data[index][columnId] : self._data[index]);
				}
			}
		});
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
	
	setAllSelection: function(checked) {
		$('.yom-data-grid-check-box, .yom-data-grid-check-box-all', this._container).each(function(i, item) {
			item.checked = !!checked;
		});
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
	
	parseFilterMap: function(filterMap) {
		var self = this;
		var res = {};
		if(typeof filterMap == 'string') {
			filterMap.split(';').forEach(function(item) {
				var filterCriteria = {};
				var parts  = item.split(',');
				var column = self.getColumnById(parts.shift());
				if(column) {
					var filterOption = column.filterOption || {};
					filterCriteria.findEmpty = parts.shift() == '1';
					if(!filterCriteria.findEmpty) {
						var value;
						if(filterOption.type == 'set') {
							value = parts;
							var valueMap = {};
							value.forEach(function(id) {
								valueMap[id] = 1;
							});
							filterCriteria.valueMap = valueMap;
							filterCriteria.value = value;
						} else if(filterOption.type == 'number') {
							var compareType = parts.shift();
							value = parseFloat(parts.shift()) || '';
							filterCriteria.compareType = compareType;
							filterCriteria.value = value;
						} else {
							value = parts.shift();
							filterCriteria.value = value;
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
		if (typeof filterMap == 'string') {
			return filterMap;
		}
		var filters = [];
		for(var p in filterMap) {
			if(Object.prototype.hasOwnProperty.call(filterMap, p)) {
				var criteria = filterMap[p];
				if(criteria.findEmpty) {
					filters.push(p + ',1');
				} else {
					if(criteria.type == 'set') {
						filters.push(p + ',0,' + criteria.value.join(','));
					} else if(criteria.type == 'number') {
						filters.push(p + ',0,' + criteria.compareType + ',' +  criteria.value);
					} else {
						filters.push(p + ',0,' + criteria.value);
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

	render: function(data, state, setting) {
		state = state || {};
		if(!data || !data.length) {
			return;
		}
		if(setting) {
			this.setColumns(this._allColumns, setting);
		}
		this._data = data;
		this._sortColumnId = state.sortColumnId || this._sortColumnId;
		this._sortOrder = state.sortOrder || this._sortOrder;
		this._setFilterMap(state.filterMap);
		if(this._opt.onBeforeRender) {
			this._opt.onBeforeRender();
		}
		if(this._scrollBody) {
			this._scrollBody.off('scroll', this._bind.scroll);
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
			dataProperty: this._opt.dataProperty
		}));
		this._lockedBody = $('.yom-data-grid-locked-columns .yom-data-grid-body', this._container)[0];
		this._scrollHeader = $('.yom-data-grid-columns .yom-data-grid-header', this._container)[0];
		this._scrollBody = $('.yom-data-grid-columns .yom-data-grid-body', this._container);
		this._scrollBody.on('scroll', this._bind.scroll);
		this._settingPanel = $('.yom-data-grid-setting-panel', this._container);
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
	}
});

module.exports = YomDataGrid;
