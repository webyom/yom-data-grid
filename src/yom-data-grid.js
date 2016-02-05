var $ = require('jquery') || window.jQuery || window.$;
var mainTpl = require('./yom-data-grid.tpl.html');
var filterPanelTpl = require('./filter-panel.tpl.html');

var YomDataGrid = function(holder, columns, opt) {
	var self = this;
	opt = opt || {};
	this._opt = opt;
	this._name = opt.name || 'x';
	this._width = opt.width;
	this._holder = $(holder);
	this._container = $('<div class="yom-data-grid-container' + (opt.height == '100%' ? ' yom-data-grid-container-height' : '') + '"></div>').appendTo(holder);
	this._filterPanel = $('<div class="yom-data-grid-filter-panel"></div>').appendTo(document.body);
	this._allColumns = [];
	this._defaultLockedColumns = [];
	this._lockedColumns = [];
	this._scrollColumns = [];
	this._data = [];
	this._lockedBody = null;
	this._scrollHeader = null;
	this._scrollBody = null;
	this._sortColumnId = opt.sortColumnId || '';
	this._sortOrder = opt.sortOrder || '';
	this._filterMap = opt.filterMap || {};
	this._bind = {
		scroll: function(evt) {return self._onScroll(evt);},
		hideFilterPanel: function(evt) {return self._hideFilterPanel(evt);}
	};
	this.setColumns(columns);
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
	},

	_clientSort: function(columnId, sortOrder) {
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
	
	_showFilterPanel: function(column, icon) {
		var offset = icon.offset();
		var width = icon.outerWidth();
		var height = icon.outerHeight();
		var left = offset.left;
		var top = offset.top + height;
		this._filterPanel.html(filterPanelTpl.render({
			column: column,
			filterData: this._filterMap[column.id]
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
	},

	_bindEvent: function() {
		var self = this;
		this._container.delegate('.yom-data-grid-sortable', 'click', function(evt) {
			var columnId = $(this).closest('[data-column-id]').data('column-id');
			var sortOrder = $('.yom-data-grid-sort-arrow-down', this).length ? 'asc' : 'desc';
			self._sortOrder = sortOrder;
			self._sortColumnId = columnId;
			if(self._opt.onSort) {
				self._opt.onSort(columnId, sortOrder);
			} else {
				self._clientSort();
			}
		}).delegate('.yom-data-grid-filter-icon', 'click', function(evt) {
			var cell = $(this).closest('[data-column-id]');
			var columnId = cell.data('column-id');
			var column = self._allColumns.filter(function(item) {
				return item.id == columnId;
			})[0];
			if(column) {
				self._showFilterPanel(column, $(this));
			}
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
		});
		if(this._opt.hightLightRow) {
			this._container.delegate('[data-grid-row]', 'mouseenter', function(evt) {
				$('[data-grid-row]', self._container).removeClass('yom-data-grid-row-hl');
				$('[data-grid-row="' + $(this).data('grid-row') + '"]', self._container).addClass('yom-data-grid-row-hl');
			}).delegate('[data-grid-row]', 'mouseleave', function(evt) {
				$('[data-grid-row="' + $(this).data('grid-row') + '"]', self._container).removeClass('yom-data-grid-row-hl');
			})
		}
		$(document).on('click', this._bind.hideFilterPanel);
	},

	_unbindEvent: function() {
		this._container.undelegate();
		this._filterPanel.undelegate();
	},

	setColumns: function(columns) {
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
		$.each(this._allColumns, function(i, column) {
			if(column) {
				column.width = parseInt(column.width) || 0;
				if(column.width > 0) {
					column.width = Math.min(Math.max(column.width, self._MIN_COLUMN_WIDTH), self._MAX_COLUMN_WIDTH);
				}
				if(column.locked && lockedCount < self._MAX_LOCKED_COLUMNS) {
					column.width = column.width || self._DEFAULT_COLUMN_WIDTH;
					column.width = Math.min(column.width, self._MAX_LOCKED_COLUMN_WIDTH);
					self._lockedColumns.push(column);
					lockedCount++;
				} else {
					column.locked = false;
					self._scrollColumns.push(column);
				}
			}
		});
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

	render: function(data, opt) {
		opt = opt || {};
		if(!data || !data.length) {
			return;
		}
		this._data = data;
		this._sortColumnId = opt.sortColumnId || this._sortColumnId;
		this._sortOrder = opt.sortOrder || this._sortOrder;
		this._filterMap = opt.filterMap || this._filterMap;
		if(this._opt.onBeforeRender) {
			this._opt.onBeforeRender();
		}
		if(this._scrollBody) {
			this._scrollBody.off('scroll', this._bind.scroll);
		}
		this._lockedBody = null;
		this._scrollHeader = null;
		this._scrollBody = null;
		var width = this._width == 'auto' ? this._holder.width() : this._width;
		if(!width && this._opt.getHolderWidth) {
			width = this._opt.getHolderWidth();
		}
		this._container.html(mainTpl.render({
			DEFAULT_COLUMN_WIDTH: this._DEFAULT_COLUMN_WIDTH,
			name: this._name,
			width: width,
			lockedColumns: this._defaultLockedColumns.concat(this._lockedColumns),
			scrollColumns: this._scrollColumns,
			bordered: this._opt.bordered,
			striped: this._opt.striped,
			sortColumnId: this._sortColumnId,
			sortOrder: this._sortOrder,
			checkbox: this._opt.checkbox,
			data: this._data,
			dataProperty: this._opt.dataProperty
		}));
		this._lockedBody = $('.yom-data-grid-locked-columns .yom-data-grid-body', this._container)[0];
		this._scrollHeader = $('.yom-data-grid-columns .yom-data-grid-header', this._container)[0];
		this._scrollBody = $('.yom-data-grid-columns .yom-data-grid-body', this._container);
		this._scrollBody.on('scroll', this._bind.scroll);
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
