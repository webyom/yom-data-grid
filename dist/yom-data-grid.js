define(['require', 'exports', 'module', './yom-data-grid.tpl.html', './filter-panel.tpl.html', './setting-panel.tpl.html', './yom-data-grid.less'], function(require, exports, module) {
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
	
	_showFilterPanel: function(column, icon) {
		this._activeFilterColumn = column;
		var offset = icon.offset();
		var width = icon.outerWidth();
		var height = icon.outerHeight();
		var left = offset.left;
		var top = offset.top + height;
		this._filterPanel.html(filterPanelTpl.render({
			column: column,
			filterMap: this._filterMap
		}));
		this._filterPanel.show();
		var filterPanelWidth = this._filterPanel.outerWidth();
		if(left > filterPanelWidth) {
			left = left - filterPanelWidth + width;
		}
		this._filterPanel.css({
			left: left + 'px',
			top: top + 'px'
		});
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
		var self = this;
		if(typeof filterMap == 'string') {
			var res = {};
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
			this._filterMap = res;
		} else if(filterMap) {
			this._filterMap = filterMap;
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
				self._showFilterPanel(column, $(this));
			}
		}).delegate('.yom-data-grid-filter-remove-icon', 'click', function(evt) {
			var cell = $(this).closest('[data-column-id]');
			var columnId = cell.data('column-id');
			self._removeFilter(columnId);
		}).delegate('.yom-data-grid-check-box, .yom-data-grid-check-box-all', 'click', function(evt) {
			var rowIndex = $(this).data('row-index');
			var allChecked = true;
			if(!(rowIndex >= 0)) {//all
				if(this.checked) {
					$('.yom-data-grid-check-box', self._container).each(function(i, item) {
						item.checked = true;
						$(item).closest('.mockup-checkbox').addClass('on');
					});
				} else {
					$('.yom-data-grid-check-box', self._container).each(function(i, item) {
						item.checked = false;
						$(item).closest('.mockup-checkbox').removeClass('on');
					});
				}
			} else {
				if(this.checked) {
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
				self._opt.onSelect(rowIndex, this.checked, rowIndex >= 0 && self._data[rowIndex] || undefined);
			}
		});
		this._filterPanel.delegate('form', 'submit', function(evt) {
			evt.preventDefault();
		}).delegate('[name="findEmpty"]', 'click', function(evt) {
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

	setColumns: function(columns, setting) {
		setting = setting || {};
		this._lockColumnAmount = Math.min(this._MAX_LOCKED_COLUMNS, setting.lockColumnAmount >= 0 ? setting.lockColumnAmount : this._lockColumnAmount);
		this._columnSequence = setting.columnSequence || this._columnSequence;
		this._hiddenColumns = setting.hiddenColumns || this._hiddenColumns;
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

	hightLightRow: function(index, className) {
		$('[yom-data-grid-row="' + index + '"]', this._container).addClass(className || 'yom-data-grid-row-error');
	},

	dehightLightRows: function(className) {
		$('[yom-data-grid-row]', this._container).removeClass(className || 'yom-data-grid-row-error');
	},
	
	getSetting: function() {
		return {
			lockColumnAmount: this._lockColumnAmount,
			columnSequence: this._columnSequence,
			hiddenColumns: this._hiddenColumns
		};
	},
	
	getState: function() {
		return {
			sortOrder: this._sortOrder,
			sortColumnId: this._sortColumnId,
			filterMap: $.extend({}, this._filterMap)
		};
	},
	
	getFilterMapString: function() {
		var filters = [];
		for(var p in this._filterMap) {
			if(Object.prototype.hasOwnProperty.call(this._filterMap, p)) {
				var criteria = this._filterMap[p];
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

});

define('./yom-data-grid.tpl.html', [ "require", "exports", "module" ], function(require, exports, module) {
    function $encodeHtml(str) {
        return (str + "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/`/g, "&#96;").replace(/'/g, "&#39;").replace(/"/g, "&quot;");
    }
    exports.render = function($data, $opt) {
        $data = $data || {};
        var _$out_ = [];
        var $print = function(str) {
            _$out_.push(str);
        };
        with ($data) {
            var i, j, l, l2, column, columns, columnWidth, columnHeader, columnOffset;
            var scrollX = false;
            var lockedTableWidth = 0;
            var scrollTableWidth = 0;
            var lockedDisplayColumns = [];
            var lockedColumnWidth = [];
            var lockedColumnHeader = [];
            var scrollDisplayColumns = [];
            var scrollColumnWidth = [];
            var scrollColumnHeader = [];
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
                    with ($data) {
                        columnWidth.push('<colgroup><col style="width: ', column.locked ? column.width : noScrollX ? 0 : column.width, 'px;"></colgroup>');
                        columnHeader.push('<th class="', column.type == "checkbox" ? "yom-data-grid-checkbox-cell" : "", " ", i == l - 1 ? "yom-data-grid-last-cell" : "", " yom-data-grid-column-", column.id.replace(/\./g, "-"), '"><div data-column-id="', column.id, '" class="yom-data-grid-cell-inner yom-data-grid-header-cell-inner" style="text-align: ', column.textAlign || "left", ';">');
                        if (column.type == "checkbox") {
                            columnHeader.push('<input class="yom-data-grid-check-box-all" type="checkbox" />');
                        } else if (column.type == "sequence") {
                            columnHeader.push('<span title="', $encodeHtml(column.name), '">', column.name, "</span>");
                        } else {
                            columnHeader.push("");
                            if (filterMap[column.id]) {
                                columnHeader.push('<a class="yom-data-grid-filter-remove-icon" href="javascript:void(0);" title="清除过滤条件"><i class="fa fa-filter icon-filter"></i><i class="fa fa-remove icon-remove"></i></a> ');
                            }
                            if (column.headerRenderer) {
                                columnHeader.push("", column.headerRenderer(column.name, i, column, sortColumnId, sortOrder), "");
                            } else if (column.sortable) {
                                columnHeader.push('<a class="yom-data-grid-sortable" href="javascript:void(0);" onclick="return false" title="', $encodeHtml(column.name), '">', column.name, "", sortColumnId == column.id ? sortOrder == "desc" ? '<span class="yom-data-grid-sort-arrow-down"></span>' : '<span class="yom-data-grid-sort-arrow-up"></span>' : "", "</a>");
                            } else {
                                columnHeader.push('<span title="', $encodeHtml(column.name), '">', column.name, "</span>");
                            }
                            if (column.filterable) {
                                columnHeader.push('<div class="yom-data-grid-filter-icon ', column.textAlign == "right" ? "yom-data-grid-filter-icon-left" : "", '"><i class="fa fa-filter"></i></div>');
                            }
                        }
                        columnHeader.push("</div></th>");
                    }
                })();
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
                    with ($data) {
                        columnWidth.push('<colgroup><col style="width: ', column.locked ? column.width : noScrollX ? 0 : column.width, 'px;"></colgroup>');
                        columnHeader.push('<th class="', column.type == "checkbox" ? "yom-data-grid-checkbox-cell" : "", " ", i == l - 1 ? "yom-data-grid-last-cell" : "", " yom-data-grid-column-", column.id.replace(/\./g, "-"), '"><div data-column-id="', column.id, '" class="yom-data-grid-cell-inner yom-data-grid-header-cell-inner" style="text-align: ', column.textAlign || "left", ';">');
                        if (column.type == "checkbox") {
                            columnHeader.push('<input class="yom-data-grid-check-box-all" type="checkbox" />');
                        } else if (column.type == "sequence") {
                            columnHeader.push('<span title="', $encodeHtml(column.name), '">', column.name, "</span>");
                        } else {
                            columnHeader.push("");
                            if (filterMap[column.id]) {
                                columnHeader.push('<a class="yom-data-grid-filter-remove-icon" href="javascript:void(0);" title="清除过滤条件"><i class="fa fa-filter icon-filter"></i><i class="fa fa-remove icon-remove"></i></a> ');
                            }
                            if (column.headerRenderer) {
                                columnHeader.push("", column.headerRenderer(column.name, i, column, sortColumnId, sortOrder), "");
                            } else if (column.sortable) {
                                columnHeader.push('<a class="yom-data-grid-sortable" href="javascript:void(0);" onclick="return false" title="', $encodeHtml(column.name), '">', column.name, "", sortColumnId == column.id ? sortOrder == "desc" ? '<span class="yom-data-grid-sort-arrow-down"></span>' : '<span class="yom-data-grid-sort-arrow-up"></span>' : "", "</a>");
                            } else {
                                columnHeader.push('<span title="', $encodeHtml(column.name), '">', column.name, "</span>");
                            }
                            if (column.filterable) {
                                columnHeader.push('<div class="yom-data-grid-filter-icon ', column.textAlign == "right" ? "yom-data-grid-filter-icon-left" : "", '"><i class="fa fa-filter"></i></div>');
                            }
                        }
                        columnHeader.push("</div></th>");
                    }
                })();
            }
            if (!noScrollX && width > 0) {
                if (noWidthScrollColumns.length) {
                    if (width - lockedTableWidth - scrollTableWidth < noWidthScrollColumns.length * DEFAULT_COLUMN_WIDTH) {
                        for (i = 0, l = noWidthScrollColumns.length; i < l; i++) {
                            noWidthScrollColumns[i].width = DEFAULT_COLUMN_WIDTH;
                        }
                        scrollTableWidth += noWidthScrollColumns.length * DEFAULT_COLUMN_WIDTH;
                        scrollColumnWidth = [];
                        for (i = 0, l = scrollDisplayColumns.length; i < l; i++) {
                            column = scrollDisplayColumns[i];
                            scrollColumnWidth.push('<colgroup><col style="width: ', column.width || DEFAULT_COLUMN_WIDTH, 'px;"></colgroup>');
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
            _$out_.push('<div class="yom-data-grid-setting-icon"><i class="fa fa-cog"></i></div><div class="yom-data-grid-setting-panel"></div><div class="yom-data-grid ', lockedDisplayColumns.length ? "yom-data-grid-locked" : "", " ", bordered ? "yom-data-grid-bordered" : "", " ", striped ? "yom-data-grid-striped" : "", '" style="overflow: hidden;"><table border="0" cellspacing="0" cellpadding="0" style="width: 100%; height: 100%;"><tr>');
            if (lockedDisplayColumns.length) {
                _$out_.push('<td class="yom-data-grid-columns-container" style="width: ', lockedTableWidth, 'px;"><div class="yom-data-grid-locked-columns" style="overflow: hidden;"><div class="yom-data-grid-header"><table class="yom-data-grid-table" border="0" cellspacing="0" cellpadding="0" style="width: ', lockedTableWidth, 'px;">', lockedColumnWidth.join(""), "<tbody><tr>", lockedColumnHeader.join(""), '</tr></tbody></table></div><div class="yom-data-grid-body" style="', scrollX ? "overflow-x: scroll;" : "", " width: ", lockedTableWidth, 'px;"><table class="yom-data-grid-table" border="0" cellspacing="0" cellpadding="0" style="width: ', lockedTableWidth, 'px;">', lockedColumnWidth.join(""), "<tbody>");
                columnOffset = 0;
                columns = lockedDisplayColumns;
                (function() {
                    with ($data) {
                        var item, columnValue, displayValue, title, ids;
                        for (i = 0, l = data.length; i < l; i++) {
                            item = dataProperty ? data[i][dataProperty] : data[i];
                            _$out_.push('<tr data-grid-row="', i, '" class="', i == l - 1 ? "yom-data-grid-last-row" : "", " ", i % 2 === 0 ? "yom-data-grid-row-odd" : "", '">');
                            for (j = 0, l2 = columns.length; j < l2; j++) {
                                column = columns[j];
                                _$out_.push('<td id="yom-data-grid-', name, "-cell-", i, "-", j + columnOffset, '" class="', column.type == "sequence" ? "yom-data-grid-sequence-cell" : column.type == "checkbox" ? "yom-data-grid-checkbox-cell" : "", " ", j == l2 - 1 ? "yom-data-grid-last-cell" : "", " yom-data-grid-column-", column.id.replace(/\./g, "-"), '">');
                                ids = column.id.split(".");
                                columnValue = item[ids.shift()];
                                while (ids.length && columnValue) {
                                    columnValue = columnValue[ids.shift()];
                                }
                                if (column.renderer) {
                                    displayValue = column.renderer(columnValue, i, item, j + columnOffset, column);
                                } else {
                                    displayValue = $encodeHtml(columnValue || "");
                                }
                                if (column.titleRenderer) {
                                    title = column.titleRenderer(columnValue, i, item, j + columnOffset, column);
                                } else if (typeof column.title != "undefined") {
                                    if (column.title == "__content__") {
                                        title = displayValue;
                                    } else {
                                        title = column.title;
                                    }
                                } else {
                                    title = columnValue || "";
                                }
                                _$out_.push('<div class="yom-data-grid-cell-inner" title="', $encodeHtml(title), '" style="text-align: ', column.textAlign || "left", ';">');
                                if (column.type == "sequence") {
                                    _$out_.push("", i + 1, "");
                                } else if (column.type == "checkbox") {
                                    if (checkbox && checkbox.checkable) {
                                        if (checkbox.checkable(item, i)) {
                                            _$out_.push('<input class="yom-data-grid-check-box" data-row-index="', i, '" type="checkbox" />');
                                        } else {
                                            _$out_.push('<input type="checkbox" disabled />');
                                        }
                                    } else {
                                        _$out_.push('<input class="yom-data-grid-check-box" data-row-index="', i, '" type="checkbox" />');
                                    }
                                } else {
                                    _$out_.push("", displayValue || "&nbsp;", "");
                                }
                                _$out_.push("</div></td>");
                            }
                            _$out_.push("</tr>");
                        }
                    }
                })();
                _$out_.push("</tbody></table></div></div></td>");
            }
            if (scrollDisplayColumns.length) {
                _$out_.push('<td class="yom-data-grid-columns-container"><div class="yom-data-grid-columns"><div class="yom-data-grid-header" style="width: 100%;"><table class="yom-data-grid-table" border="0" cellspacing="0" cellpadding="0" style="width: ', width > lockedTableWidth ? width - lockedTableWidth + "px" : "100%", ';">', scrollColumnWidth.join(""), "<tbody><tr>", scrollColumnHeader.join(""), '</tr></tbody></table></div><div class="yom-data-grid-body" style="', scrollX ? "overflow-x: scroll;" : "", ' width: 100%;"><table class="yom-data-grid-table" border="0" cellspacing="0" cellpadding="0" style="width: ', width > lockedTableWidth ? width - lockedTableWidth + "px" : "100%", ';">', scrollColumnWidth.join(""), "<tbody>");
                columnOffset = lockedDisplayColumns.length;
                columns = scrollDisplayColumns;
                (function() {
                    with ($data) {
                        var item, columnValue, displayValue, title, ids;
                        for (i = 0, l = data.length; i < l; i++) {
                            item = dataProperty ? data[i][dataProperty] : data[i];
                            _$out_.push('<tr data-grid-row="', i, '" class="', i == l - 1 ? "yom-data-grid-last-row" : "", " ", i % 2 === 0 ? "yom-data-grid-row-odd" : "", '">');
                            for (j = 0, l2 = columns.length; j < l2; j++) {
                                column = columns[j];
                                _$out_.push('<td id="yom-data-grid-', name, "-cell-", i, "-", j + columnOffset, '" class="', column.type == "sequence" ? "yom-data-grid-sequence-cell" : column.type == "checkbox" ? "yom-data-grid-checkbox-cell" : "", " ", j == l2 - 1 ? "yom-data-grid-last-cell" : "", " yom-data-grid-column-", column.id.replace(/\./g, "-"), '">');
                                ids = column.id.split(".");
                                columnValue = item[ids.shift()];
                                while (ids.length && columnValue) {
                                    columnValue = columnValue[ids.shift()];
                                }
                                if (column.renderer) {
                                    displayValue = column.renderer(columnValue, i, item, j + columnOffset, column);
                                } else {
                                    displayValue = $encodeHtml(columnValue || "");
                                }
                                if (column.titleRenderer) {
                                    title = column.titleRenderer(columnValue, i, item, j + columnOffset, column);
                                } else if (typeof column.title != "undefined") {
                                    if (column.title == "__content__") {
                                        title = displayValue;
                                    } else {
                                        title = column.title;
                                    }
                                } else {
                                    title = columnValue || "";
                                }
                                _$out_.push('<div class="yom-data-grid-cell-inner" title="', $encodeHtml(title), '" style="text-align: ', column.textAlign || "left", ';">');
                                if (column.type == "sequence") {
                                    _$out_.push("", i + 1, "");
                                } else if (column.type == "checkbox") {
                                    if (checkbox && checkbox.checkable) {
                                        if (checkbox.checkable(item, i)) {
                                            _$out_.push('<input class="yom-data-grid-check-box" data-row-index="', i, '" type="checkbox" />');
                                        } else {
                                            _$out_.push('<input type="checkbox" disabled />');
                                        }
                                    } else {
                                        _$out_.push('<input class="yom-data-grid-check-box" data-row-index="', i, '" type="checkbox" />');
                                    }
                                } else {
                                    _$out_.push("", displayValue || "&nbsp;", "");
                                }
                                _$out_.push("</div></td>");
                            }
                            _$out_.push("</tr>");
                        }
                    }
                })();
                _$out_.push("</tbody></table></div></div></td>");
            }
            _$out_.push("</tr></table></div>");
        }
        return _$out_.join("");
    };
});

define('./filter-panel.tpl.html', [ "require", "exports", "module" ], function(require, exports, module) {
    function $encodeHtml(str) {
        return (str + "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/`/g, "&#96;").replace(/'/g, "&#39;").replace(/"/g, "&quot;");
    }
    exports.render = function($data, $opt) {
        $data = $data || {};
        var _$out_ = [];
        var $print = function(str) {
            _$out_.push(str);
        };
        with ($data) {
            var filterCriteria = filterMap[column.id] || {};
            var filterOption = column.filterOption || {};
            var type = filterOption.type;
            _$out_.push('<h3><i class="fa fa-filter"></i> ', $encodeHtml(column.name || "筛选"), '</h3><form data-column-id="', column.id, '"><div class="alert alert-danger hidden"></div><div class="filter-option ', filterCriteria.findEmpty ? "hidden" : "", '">');
            if (type == "set") {
                var options = filterOption.options || [];
                var valueMap = filterCriteria.valueMap || {};
                _$out_.push('<div class="set-container">');
                for (var i = 0, l = options.length; i < l; i++) {
                    var option = options[i];
                    _$out_.push('<div class="checkbox"><label><input type="checkbox" value="', $encodeHtml(option.value), '" ', valueMap[option.value] ? "checked" : "", " /> ", $encodeHtml(option.name), "</label></div>");
                }
                _$out_.push("</div>");
            } else if (type == "number") {
                _$out_.push('<div class="form-group"><label>比较方式</label><select name="compareType" class="form-control"><option value="eq" ', filterCriteria.compareType == "eq" ? "selected" : "", '>等于</option><option value="lt" ', filterCriteria.compareType == "lt" ? "selected" : "", '>小于</option><option value="gt" ', filterCriteria.compareType == "gt" ? "selected" : "", '>大于</option></select></div><div class="form-group"><label>比较值</label><input name="value" type="text" maxlength="10" value="', filterCriteria.value || filterCriteria.value === 0 ? filterCriteria.value : "", '" class="form-control" /></div>');
            } else {
                _$out_.push('<div class="form-group"><input name="value" type="text" value="', filterCriteria.value || "", '" class="form-control" /></div>');
            }
            _$out_.push('</div><div class="checkbox"><label><input name="findEmpty" type="checkbox" ', filterCriteria.findEmpty ? "checked" : "", ' /> 空（未填写）</label></div><div class="row"><div class="col-xs-8"><button type="submit" class="btn btn-primary btn-sm btn-confirm">确定</button> <button type="button" class="btn btn-default btn-sm" data-toggle="yom-data-grid-filter-panel">取消</button> </div><div class="col-xs-4 text-right">');
            if (filterMap[column.id]) {
                _$out_.push('<a class="btn btn-remove" href="javascript:void(0);">清除</a>');
            }
            _$out_.push("</div></div></form>");
        }
        return _$out_.join("");
    };
});

define('./setting-panel.tpl.html', [ "require", "exports", "module" ], function(require, exports, module) {
    function $encodeHtml(str) {
        return (str + "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/`/g, "&#96;").replace(/'/g, "&#39;").replace(/"/g, "&quot;");
    }
    exports.render = function($data, $opt) {
        $data = $data || {};
        var _$out_ = [];
        var $print = function(str) {
            _$out_.push(str);
        };
        with ($data) {
            _$out_.push('<h3><i class="fa fa-cog"></i> 设置</h3><div class="alert alert-danger hidden"></div><h4>显示和排序</h4><div class="columns-container"><div class="yom-data-grid-setting-columns-container-inner">');
            for (var i = 0, l = columns.length; i < l; i++) {
                var column = columns[i];
                _$out_.push('<div class="yom-data-grid-setting-column-item"><input type="checkbox" value="', $encodeHtml(column.id), '" ', hiddenColumns.indexOf(column.id) >= 0 ? "" : "checked", " /> ", $encodeHtml(column.name), "</div>");
            }
            _$out_.push('</div><button class="btn btn-default btn-sm yom-data-grid-setting-btn-move-up disabled" disabled><i class="fa fa-long-arrow-up "></i></button><button class="btn btn-default btn-sm yom-data-grid-setting-btn-move-down disabled" disabled><i class="fa fa-long-arrow-down"></i></button></div><h4>锁定</h4><div class="lock-options">');
            for (var i = 1; i <= MAX_LOCKED_COLUMNS; i++) {
                _$out_.push('<label class="radio-inline"><input type="radio" name="lock" value="', i, '" ', lockColumnAmount == i ? "checked" : "", " /> ", i, "列</label> ");
            }
            _$out_.push('<label class="radio-inline"><input type="radio" name="lock" value="0" ', lockColumnAmount == 0 ? "checked" : "", ' /> 不锁定</label></div><button type="submit" class="btn btn-primary btn-sm yom-data-grid-btn-confirm-setting">确定</button> <button type="button" class="btn btn-default btn-sm" data-toggle="yom-data-grid-setting-panel">取消</button> ');
        }
        return _$out_.join("");
    };
});

define('./yom-data-grid.less', ['require', 'exports', 'module'], function(require, exports, module) {
    var cssContent = '.yom-data-grid-container{height:100%;position:relative}.yom-data-grid{border:1px solid #ccc;height:100%;-webkit-border-radius:2px;-moz-border-radius:2px;border-radius:2px}.yom-data-grid:after,.yom-data-grid:before{display:table;content:"";line-height:0}.yom-data-grid:after{clear:both}.yom-data-grid-locked table{table-layout:fixed}.yom-data-grid-locked table td,.yom-data-grid-locked table th{line-height:21px}.yom-data-grid-locked table td i[class^=icon]{font-size:17.5px}.yom-data-grid .yom-data-grid-body,.yom-data-grid .yom-data-grid-header{overflow:hidden}.yom-data-grid-table th{text-align:left}.yom-data-grid-table td{background-color:#fff}.yom-data-grid-cell-inner{line-height:15.4px;font-size:14px;padding:11px 9px}.yom-data-grid-bordered .yom-data-grid-cell-inner{border-bottom:solid 1px #ccc;border-right:solid 1px #ccc}.yom-data-grid-bordered th .yom-data-grid-cell-inner{border-bottom-width:2px}.yom-data-grid-bordered .yom-data-grid-last-row .yom-data-grid-cell-inner{border-bottom:none}.yom-data-grid-bordered .yom-data-grid-last-cell .yom-data-grid-cell-inner{border-right:none}.yom-data-grid-locked .yom-data-grid-cell-inner{overflow:hidden;text-overflow:ellipsis;height:38.8px}.yom-data-grid-locked-columns{border-right:solid 2px #ccc}.yom-data-grid-striped .yom-data-grid-table .yom-data-grid-row-odd td{background-color:#f8f8f8}.yom-data-grid-sortable,.yom-data-grid-sortable:hover{color:#555;text-decoration:underline}.yom-data-grid-sort-arrow-down,.yom-data-grid-sort-arrow-up{display:inline-block;width:0;height:0;vertical-align:middle;border-right:4px solid transparent;border-left:4px solid transparent;content:"";margin-left:3px}.yom-data-grid-sort-arrow-down{border-top:4px solid #555}.yom-data-grid-sort-arrow-up{border-bottom:4px solid #555}.yom-data-grid-header-cell-inner{position:relative}.yom-data-grid-header-cell-inner .yom-data-grid-filter-icon{position:absolute;width:20px;height:20px;line-height:20px;text-align:center;top:50%;right:9px;margin-top:-10px;background-color:#eee;cursor:pointer;color:#555;display:none;-webkit-border-radius:2px;-moz-border-radius:2px;border-radius:2px}.yom-data-grid-header-cell-inner .yom-data-grid-filter-icon-left{left:9px;right:auto}.yom-data-grid-header-cell-inner:hover .yom-data-grid-filter-icon{display:block}.yom-data-grid-header-cell-inner:hover .yom-data-grid-filter-remove-icon .icon-remove{display:inline-block}.yom-data-grid-header-cell-inner:hover .yom-data-grid-filter-remove-icon .icon-filter{display:none}.yom-data-grid-filter-panel{position:absolute;border:1px solid #ccc;background-color:#fff;width:220px;padding:10px;display:none;z-index:1;-webkit-border-radius:2px;-moz-border-radius:2px;border-radius:2px}.yom-data-grid-filter-panel h3{font-size:14px;margin:0 0 10px;color:#555}.yom-data-grid-filter-panel .alert-danger{padding:10px}.yom-data-grid-filter-panel .set-container{background-color:#f8f8f8;padding-left:10px;overflow-x:hidden;overflow-y:auto;max-height:138px;-webkit-border-radius:2px;-moz-border-radius:2px;border-radius:2px}.yom-data-grid-filter-remove-icon{color:#555}.yom-data-grid-filter-remove-icon .icon-remove{display:none}.yom-data-grid-filter-remove-icon:hover{color:#555}.yom-data-grid-setting-icon{position:absolute;width:20px;height:20px;line-height:20px;text-align:center;top:-20px;left:0;background-color:#eee;cursor:pointer;color:#555;z-index:1;display:none;-webkit-border-radius:2px;-moz-border-radius:2px;border-radius:2px}.yom-data-grid-container-sequence .yom-data-grid-setting-icon{top:8px;left:8px}.yom-data-grid-container:hover .yom-data-grid-setting-icon{display:block}.yom-data-grid-setting-panel{position:absolute;left:0;top:0;border:1px solid #ccc;background-color:#fff;width:300px;padding:10px;display:none;z-index:2;-webkit-border-radius:2px;-moz-border-radius:2px;border-radius:2px}.yom-data-grid-setting-panel h3,.yom-data-grid-setting-panel h4{font-size:14px;margin:0 0 10px;color:#555}.yom-data-grid-setting-panel h4{margin-top:10px}.yom-data-grid-setting-panel .alert-danger{padding:10px}.yom-data-grid-setting-panel .columns-container{position:relative;padding-right:40px}.yom-data-grid-setting-panel .yom-data-grid-setting-columns-container-inner{background-color:#f8f8f8;overflow-x:hidden;overflow-y:auto;max-height:266px;padding:5px 0;-webkit-border-radius:2px;-moz-border-radius:2px;border-radius:2px}.yom-data-grid-setting-panel .lock-options{margin-bottom:10px}.yom-data-grid-setting-column-item{padding:3px 10px;position:relative;cursor:pointer}.yom-data-grid-setting-column-item .yom-data-grid-setting-btn-move-down,.yom-data-grid-setting-column-item .yom-data-grid-setting-btn-move-up{position:absolute;top:0;right:2px;display:inline-block;width:18px;text-align:center}.yom-data-grid-setting-column-item .yom-data-grid-setting-btn-move-up{right:22px}.yom-data-grid-setting-column-item.selected{background-color:#ddd}.yom-data-grid-setting-btn-move-down,.yom-data-grid-setting-btn-move-up{position:absolute;right:0;top:50%;margin-top:-40px}.yom-data-grid-setting-btn-move-down{position:absolute;right:0;top:50%;margin-top:10px}.yom-data-grid .yom-data-grid-table .yom-data-grid-row-hl td{background-color:#ffe}.yom-data-grid .yom-data-grid-table .yom-data-grid-row-error td{background-color:#f2dede}.yom-data-grid .yom-data-grid-table .yom-data-grid-row-error.yom-data-grid-row-hl td{background-color:#ebcccc}.yom-data-grid .yom-data-grid-table .yom-data-grid-sequence-cell{background-color:#fff!important;border-bottom:none;font-weight:700;color:#888}.yom-data-grid-sequence-cell .yom-data-grid-cell-inner{border-bottom:none;text-overflow:clip}.yom-data-grid-checkbox-cell .yom-data-grid-cell-inner{text-overflow:clip}.yom-data-grid-checkbox-cell input[type=checkbox]{margin:0}.yom-data-grid-container-height .yom-data-grid-columns-container{position:relative}.yom-data-grid-container-height .yom-data-grid-columns,.yom-data-grid-container-height .yom-data-grid-locked-columns{position:absolute;left:0;top:0;right:0;bottom:0}.yom-data-grid-container-height .yom-data-grid-body{position:absolute;top:39px;left:0;right:0;bottom:0}.yom-data-grid-container-height .yom-data-grid-columns .yom-data-grid-body,.yom-data-grid-container-height .yom-data-grid-columns .yom-data-grid-header{overflow-y:scroll}';
    var moduleUri = module && module.uri;
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
    module.exports = cssContent;
});